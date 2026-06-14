import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as os from 'os';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { Dealer } from '../../entities/dealer.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Message } from '../../entities/message.entity';
import { Call } from '../../entities/call.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
    @InjectRepository(Dealer) private readonly dealerRepo: Repository<Dealer>,
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(Call) private readonly callRepo: Repository<Call>,
  ) {}

  async getSystemOverview() {
    const [totalUsers, totalOrgs, totalDealers, totalMessages, totalCalls] = await Promise.all([
      this.userRepo.count(),
      this.orgRepo.count(),
      this.dealerRepo.count(),
      this.msgRepo.count(),
      this.callRepo.count(),
    ]);

    return {
      totalUsers, totalOrgs, totalDealers, totalMessages, totalCalls,
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.cpus(),
        platform: os.platform(),
        nodeVersion: process.version,
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        loadAvg: os.loadavg(),
      },
    };
  }

  async getAllOrganizations(page = 1, limit = 20) {
    return this.orgRepo.find({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getAllUsers(page = 1, limit = 20) {
    return this.userRepo.find({
      select: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt', 'lastLoginAt', 'organizationId'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getAllDealers() {
    return this.dealerRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getAuditLogs(page = 1, limit = 50) {
    const [data, total] = await this.auditRepo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async toggleOrganization(orgId: string, isActive: boolean) {
    await this.orgRepo.update(orgId, { isActive });
    return { message: `Organization ${isActive ? 'activated' : 'suspended'}` };
  }
}
