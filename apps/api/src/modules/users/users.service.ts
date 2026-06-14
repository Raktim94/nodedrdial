import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { User, UserRole } from '../../entities/user.entity';
import { paginate, getPaginationOffset } from '../../common/utils/pagination.util';

export class InviteUserDto {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export class UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  timezone?: string;
  preferences?: Record<string, any>;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepo: Repository<User>) {}

  async findAll(organizationId: string, page = 1, limit = 20) {
    const { skip, take } = getPaginationOffset(page, limit);
    const [data, total] = await this.userRepo.findAndCount({
      where: { organizationId },
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
      order: { createdAt: 'DESC' },
      skip, take,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(id: string, organizationId?: string) {
    const where: any = { id };
    if (organizationId) where.organizationId = organizationId;
    const user = await this.userRepo.findOne({ where });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async invite(organizationId: string, dto: InviteUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw new ConflictException('Email already registered');

    const tempPassword = crypto.randomBytes(16).toString('hex');
    const password = await argon2.hash(tempPassword);

    const user = this.userRepo.create({
      ...dto,
      email: dto.email.toLowerCase(),
      password,
      organizationId,
      isActive: true,
      emailVerified: false,
    });
    await this.userRepo.save(user);

    // TODO: send invitation email with tempPassword
    return { message: 'Invitation sent', userId: user.id };
  }

  async update(id: string, dto: UpdateUserDto, organizationId?: string) {
    const user = await this.findOne(id, organizationId);
    Object.assign(user, dto);
    return this.userRepo.save(user);
  }

  async deactivate(id: string, organizationId: string) {
    await this.userRepo.update({ id, organizationId }, { isActive: false });
    return { message: 'User deactivated' };
  }

  async activate(id: string, organizationId: string) {
    await this.userRepo.update({ id, organizationId }, { isActive: true });
    return { message: 'User activated' };
  }
}
