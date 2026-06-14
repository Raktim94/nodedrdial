import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageDirection } from '../../entities/message.entity';
import { Call, CallDirection } from '../../entities/call.entity';
import { Contact } from '../../entities/contact.entity';
import { Campaign } from '../../entities/campaign.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(Call) private readonly callRepo: Repository<Call>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Campaign) private readonly campaignRepo: Repository<Campaign>,
  ) {}

  async getDashboardStats(organizationId: string) {
    const [
      totalMessages, totalCalls, totalContacts, totalCampaigns,
      inboundMessages, outboundMessages, inboundCalls, outboundCalls,
    ] = await Promise.all([
      this.msgRepo.count({ where: { organizationId } }),
      this.callRepo.count({ where: { organizationId } }),
      this.contactRepo.count({ where: { organizationId } }),
      this.campaignRepo.count({ where: { organizationId } }),
      this.msgRepo.count({ where: { organizationId, direction: MessageDirection.INBOUND } }),
      this.msgRepo.count({ where: { organizationId, direction: MessageDirection.OUTBOUND } }),
      this.callRepo.count({ where: { organizationId, direction: CallDirection.INBOUND } }),
      this.callRepo.count({ where: { organizationId, direction: CallDirection.OUTBOUND } }),
    ]);

    return {
      totalMessages, totalCalls, totalContacts, totalCampaigns,
      inboundMessages, outboundMessages, inboundCalls, outboundCalls,
    };
  }

  async getMessageActivity(organizationId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await this.msgRepo
      .createQueryBuilder('m')
      .select("DATE_TRUNC('day', m.created_at)", 'date')
      .addSelect("COUNT(*) FILTER (WHERE m.direction = 'outbound')", 'sent')
      .addSelect("COUNT(*) FILTER (WHERE m.direction = 'inbound')", 'received')
      .where('m.organization_id = :orgId', { orgId: organizationId })
      .andWhere('m.created_at >= :since', { since })
      .groupBy("DATE_TRUNC('day', m.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      date: r.date,
      sent: parseInt(r.sent),
      received: parseInt(r.received),
    }));
  }

  async getCallActivity(organizationId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await this.callRepo
      .createQueryBuilder('c')
      .select("DATE_TRUNC('day', c.created_at)", 'date')
      .addSelect("COUNT(*) FILTER (WHERE c.direction = 'outbound')", 'outbound')
      .addSelect("COUNT(*) FILTER (WHERE c.direction = 'inbound')", 'inbound')
      .addSelect("AVG(c.duration) FILTER (WHERE c.duration IS NOT NULL)", 'avgDuration')
      .where('c.organization_id = :orgId', { orgId: organizationId })
      .andWhere('c.created_at >= :since', { since })
      .groupBy("DATE_TRUNC('day', c.created_at)")
      .orderBy('date', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      date: r.date,
      outbound: parseInt(r.outbound),
      inbound: parseInt(r.inbound),
      avgDuration: parseFloat(r.avgDuration) || 0,
    }));
  }

  async getTopContacts(organizationId: string, limit = 10) {
    return this.contactRepo
      .createQueryBuilder('c')
      .where('c.organization_id = :orgId', { orgId: organizationId })
      .orderBy('c.message_count + c.call_count', 'DESC')
      .limit(limit)
      .getMany();
  }
}
