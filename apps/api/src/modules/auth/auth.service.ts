import {
  Injectable, UnauthorizedException, ConflictException,
  BadRequestException, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { User, UserRole } from '../../entities/user.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import {
  LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto,
  ResetPasswordDto, ChangePasswordDto, Enable2FADto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto, ip: string) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email.toLowerCase() },
      select: ['id', 'email', 'password', 'firstName', 'lastName', 'role', 'organizationId',
               'dealerId', 'isActive', 'twoFactorEnabled', 'twoFactorSecret', 'emailVerified'],
    });

    if (!user || !(await argon2.verify(user.password, dto.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated');

    if (user.twoFactorEnabled) {
      if (!dto.totpCode) throw new UnauthorizedException('2FA code required');
      const valid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: dto.totpCode,
        window: 2,
      });
      if (!valid) throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.userRepo.update(user.id, { lastLoginAt: new Date(), lastLoginIp: ip });
    await this.audit(user.id, user.organizationId, 'login', 'auth', ip);

    return this.generateTokens(user);
  }

  async register(dto: RegisterDto, ip: string) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const password = await argon2.hash(dto.password);
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    const user = this.userRepo.create({
      email: dto.email.toLowerCase(),
      password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: UserRole.ORG_OWNER,
      emailVerificationToken,
    });
    await this.userRepo.save(user);
    await this.audit(user.id, null, 'register', 'auth', ip);

    return { message: 'Registration successful. Please verify your email.' };
  }

  async refresh(dto: RefreshTokenDto) {
    try {
      const payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        select: ['id', 'email', 'role', 'organizationId', 'dealerId', 'isActive', 'refreshToken'],
      });

      if (!user || !user.isActive) throw new UnauthorizedException();

      const storedHash = user.refreshToken;
      const isValid = storedHash && await argon2.verify(storedHash, dto.refreshToken);
      if (!isValid) throw new UnauthorizedException('Refresh token expired');

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, { refreshToken: null });
    return { message: 'Logged out' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!user) return { message: 'If this email exists, a reset link has been sent.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await this.userRepo.update(user.id, { passwordResetToken: token, passwordResetExpires: expires });

    // Email would be sent here via EmailService (injected separately)
    return { message: 'If this email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { passwordResetToken: dto.token },
      select: ['id', 'passwordResetExpires'],
    });
    if (!user || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const password = await argon2.hash(dto.newPassword);
    await this.userRepo.update(user.id, {
      password,
      passwordResetToken: null,
      passwordResetExpires: null,
      refreshToken: null,
    });
    return { message: 'Password reset successful' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });
    if (!await argon2.verify(user.password, dto.currentPassword)) {
      throw new BadRequestException('Current password is incorrect');
    }
    const password = await argon2.hash(dto.newPassword);
    await this.userRepo.update(userId, { password, refreshToken: null });
    return { message: 'Password changed' };
  }

  async setup2FA(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const secret = speakeasy.generateSecret({ name: `TwilioHub (${user.email})`, length: 20 });
    await this.userRepo.update(userId, { twoFactorSecret: secret.base32 });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrCode };
  }

  async enable2FA(userId: string, dto: Enable2FADto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'twoFactorSecret'],
    });
    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: dto.totpCode,
      window: 2,
    });
    if (!valid) throw new BadRequestException('Invalid TOTP code');
    await this.userRepo.update(userId, { twoFactorEnabled: true });
    return { message: '2FA enabled' };
  }

  async disable2FA(userId: string, dto: Enable2FADto) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['id', 'twoFactorSecret'],
    });
    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: dto.totpCode,
      window: 2,
    });
    if (!valid) throw new BadRequestException('Invalid TOTP code');
    await this.userRepo.update(userId, { twoFactorEnabled: false, twoFactorSecret: null });
    return { message: '2FA disabled' };
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      dealerId: user.dealerId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const refreshHash = await argon2.hash(refreshToken);
    await this.userRepo.update(user.id, { refreshToken: refreshHash });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        dealerId: user.dealerId,
      },
    };
  }

  private async audit(userId: string, orgId: string, action: string, resource: string, ip: string) {
    const log = this.auditRepo.create({ userId, organizationId: orgId, action, resource, ip });
    await this.auditRepo.save(log);
  }
}
