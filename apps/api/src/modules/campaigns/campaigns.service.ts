import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Campaign, CampaignStatus, CampaignTargetType } from '../../entities/campaign.entity';
import { Contact } from '../../entities/contact.entity';
import { Message, MessageDirection, MessageStatus } from '../../entities/message.entity';
import { TwilioService } from '../twilio/twilio.service';
import { CreateCampaignDto, UpdateCampaignDto, ListCampaignsDto } from './dto/campaigns.dto';
import { paginate, getPaginationOffset } from '../../common/utils/pagination.util';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign) private readonly campaignRepo: Repository<Campaign>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectQueue('campaigns') private readonly campaignQueue: Queue,
    private readonly twilioService: TwilioService,
  ) {}

  async create(organizationId: string, userId: string, dto: CreateCampaignDto) {
    const campaign = this.campaignRepo.create({
      ...dto,
      organizationId,
      createdById: userId,
      status: CampaignStatus.DRAFT,
    });
    return this.campaignRepo.save(campaign);
  }

  async findAll(organizationId: string, query: ListCampaignsDto) {
    const { page = 1, limit = 20 } = query;
    const { skip, take } = getPaginationOffset(page, limit);
    const [data, total] = await this.campaignRepo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      skip, take,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(organizationId: string, id: string) {
    const campaign = await this.campaignRepo.findOne({ where: { id, organizationId } });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async update(organizationId: string, id: string, dto: UpdateCampaignDto) {
    const campaign = await this.findOne(organizationId, id);
    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Can only edit draft or scheduled campaigns');
    }
    Object.assign(campaign, dto);
    return this.campaignRepo.save(campaign);
  }

  async launch(organizationId: string, id: string) {
    const campaign = await this.findOne(organizationId, id);
    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.SCHEDULED) {
      throw new BadRequestException('Campaign is already running or completed');
    }

    const contacts = await this.getTargetContacts(campaign);
    if (contacts.length === 0) throw new BadRequestException('No contacts match the campaign criteria');

    await this.campaignRepo.update(id, {
      status: CampaignStatus.RUNNING,
      startedAt: new Date(),
      totalContacts: contacts.length,
    });

    const delay = campaign.scheduledAt ? Math.max(0, campaign.scheduledAt.getTime() - Date.now()) : 0;
    await this.campaignQueue.add('run', { campaignId: id, organizationId }, { delay });

    return { message: 'Campaign launched', totalContacts: contacts.length };
  }

  async pause(organizationId: string, id: string) {
    await this.campaignRepo.update({ id, organizationId }, { status: CampaignStatus.PAUSED });
    return { message: 'Campaign paused' };
  }

  async cancel(organizationId: string, id: string) {
    await this.campaignRepo.update({ id, organizationId }, { status: CampaignStatus.CANCELLED });
    return { message: 'Campaign cancelled' };
  }

  async runCampaign(organizationId: string, campaignId: string) {
    const campaign = await this.findOne(organizationId, campaignId);
    const contacts = await this.getTargetContacts(campaign);
    const client = await this.twilioService.getClient(organizationId);
    const appUrl = process.env.APP_URL;

    for (const contact of contacts) {
      const currentCampaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
      if (currentCampaign.status === CampaignStatus.PAUSED || currentCampaign.status === CampaignStatus.CANCELLED) break;
      if (contact.isOptedOut) { await this.campaignRepo.increment({ id: campaignId }, 'optOutCount', 1); continue; }

      try {
        const body = this.interpolateVariables(campaign.message, contact);
        const sent = await client.messages.create({
          from: campaign.fromNumber,
          to: contact.phone,
          body,
          statusCallback: `${appUrl}/api/webhooks/twilio/sms/status?orgId=${organizationId}`,
        });

        await this.msgRepo.save(this.msgRepo.create({
          organizationId, contactId: contact.id,
          fromNumber: campaign.fromNumber, toNumber: contact.phone,
          body, direction: MessageDirection.OUTBOUND, status: MessageStatus.SENT,
          twilioSid: sent.sid, campaignId, sentAt: new Date(),
        }));

        await this.campaignRepo.increment({ id: campaignId }, 'sentCount', 1);
      } catch {
        await this.campaignRepo.increment({ id: campaignId }, 'failedCount', 1);
      }

      // Rate limiting
      if (campaign.ratePerSecond > 0) {
        await new Promise((r) => setTimeout(r, 1000 / campaign.ratePerSecond));
      }
    }

    await this.campaignRepo.update(campaignId, { status: CampaignStatus.COMPLETED, completedAt: new Date() });
  }

  async getStats(organizationId: string, id: string) {
    const campaign = await this.findOne(organizationId, id);
    const deliveredCount = await this.msgRepo.count({
      where: { organizationId, campaignId: id, status: MessageStatus.DELIVERED },
    });
    return { ...campaign, deliveredCount };
  }

  async remove(organizationId: string, id: string) {
    const campaign = await this.findOne(organizationId, id);
    await this.campaignRepo.remove(campaign);
    return { message: 'Campaign deleted' };
  }

  private async getTargetContacts(campaign: Campaign): Promise<Contact[]> {
    const where: any = { organizationId: campaign.organizationId, isActive: true };
    if (campaign.targetType === CampaignTargetType.INDIVIDUAL && campaign.targetContacts?.length) {
      where.id = In(campaign.targetContacts);
    }
    if (campaign.tagFilter?.length) {
      return this.contactRepo.createQueryBuilder('c')
        .where('c.organization_id = :orgId', { orgId: campaign.organizationId })
        .andWhere('c.tags && :tags', { tags: campaign.tagFilter })
        .andWhere('c.is_active = true')
        .getMany();
    }
    return this.contactRepo.find({ where });
  }

  private interpolateVariables(template: string, contact: Contact): string {
    return template
      .replace(/\{firstName\}/g, contact.firstName || '')
      .replace(/\{lastName\}/g, contact.lastName || '')
      .replace(/\{phone\}/g, contact.phone || '')
      .replace(/\{email\}/g, contact.email || '')
      .replace(/\{company\}/g, contact.company || '');
  }
}
