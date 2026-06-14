import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User, UserRole } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { SystemConfig } from '../../entities/system-config.entity';
import { TwilioService } from '../twilio/twilio.service';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class SetupService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    @InjectRepository(SystemConfig) private readonly configRepo: Repository<SystemConfig>,
    private readonly twilioService: TwilioService,
  ) {}

  async isSetupComplete(): Promise<boolean> {
    const cfg = await this.configRepo.findOne({ where: { key: 'setup_completed' } });
    return cfg?.value === 'true';
  }

  async getStatus() {
    const complete = await this.isSetupComplete();
    const adminCount = await this.userRepo.count({ where: { role: UserRole.SUPER_ADMIN } });
    return { setupComplete: complete, hasAdmin: adminCount > 0 };
  }

  async runSetup(dto: SetupDto) {
    if (await this.isSetupComplete()) {
      throw new BadRequestException('Setup has already been completed');
    }

    // Create organization
    const slug = dto.orgName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const org = await this.orgRepo.save(
      this.orgRepo.create({ name: dto.orgName, slug, plan: 'starter' }),
    );

    // Create admin user
    const password = await argon2.hash(dto.adminPassword);
    const admin = await this.userRepo.save(
      this.userRepo.create({
        email: dto.adminEmail.toLowerCase(),
        password,
        firstName: dto.adminFirstName,
        lastName: dto.adminLastName,
        role: UserRole.SUPER_ADMIN,
        organizationId: org.id,
        emailVerified: true,
        isActive: true,
      }),
    );

    // Update org owner
    await this.orgRepo.update(org.id, { ownerId: admin.id });

    // Save Twilio credentials if provided
    if (dto.twilioAccountSid && dto.twilioAuthToken) {
      await this.twilioService.saveCredentials(org.id, {
        accountSid: dto.twilioAccountSid,
        authToken: dto.twilioAuthToken,
        apiKey: dto.twilioApiKey,
        apiSecret: dto.twilioApiSecret,
        twimlAppSid: dto.twimlAppSid,
      });

      // Test connection
      try {
        await this.twilioService.testConnection(org.id);
      } catch {
        // Non-fatal — setup still completes
      }
    }

    // Mark setup as complete
    await this.configRepo.save(
      this.configRepo.create({ key: 'setup_completed', value: 'true' }),
    );

    return { message: 'Setup completed successfully', organizationId: org.id, adminId: admin.id };
  }
}
