import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dealer } from '../../entities/dealer.entity';
import { Organization } from '../../entities/organization.entity';

@Injectable()
export class DealersService {
  constructor(
    @InjectRepository(Dealer) private readonly dealerRepo: Repository<Dealer>,
    @InjectRepository(Organization) private readonly orgRepo: Repository<Organization>,
  ) {}

  async findAll() {
    return this.dealerRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const dealer = await this.dealerRepo.findOne({ where: { id } });
    if (!dealer) throw new NotFoundException('Dealer not found');
    return dealer;
  }

  async findMyDealer(dealerId: string) {
    return this.findOne(dealerId);
  }

  async create(data: Partial<Dealer>) {
    const dealer = this.dealerRepo.create(data);
    return this.dealerRepo.save(dealer);
  }

  async update(id: string, data: Partial<Dealer>) {
    await this.dealerRepo.update(id, data);
    return this.findOne(id);
  }

  async getOrganizations(dealerId: string) {
    return this.orgRepo.find({ where: { dealerId }, order: { createdAt: 'DESC' } });
  }

  async createOrganization(dealerId: string, data: Partial<Organization>) {
    const dealer = await this.findOne(dealerId);
    const existing = await this.orgRepo.count({ where: { dealerId } });
    if (existing >= dealer.maxOrganizations) {
      throw new ForbiddenException(`Maximum organizations (${dealer.maxOrganizations}) reached`);
    }
    const org = this.orgRepo.create({ ...data, dealerId });
    return this.orgRepo.save(org);
  }

  async suspendOrganization(dealerId: string, orgId: string, reason: string) {
    await this.orgRepo.update({ id: orgId, dealerId }, {
      suspendedAt: new Date(), suspendedReason: reason,
    });
    return { message: 'Organization suspended' };
  }

  async toggleOrganization(dealerId: string, orgId: string, isActive: boolean) {
    await this.orgRepo.update({ id: orgId, dealerId }, { isActive });
    return { message: `Organization ${isActive ? 'activated' : 'suspended'}` };
  }

  async getDealerStats(dealerId: string) {
    const [orgs, activeOrgs] = await Promise.all([
      this.orgRepo.count({ where: { dealerId } }),
      this.orgRepo.count({ where: { dealerId, isActive: true } }),
    ]);
    return { totalOrgs: orgs, activeOrgs, totalUsers: 0, totalMessages: 0 };
  }
}
