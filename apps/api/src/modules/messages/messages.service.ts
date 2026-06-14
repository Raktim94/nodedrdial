import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Message, MessageDirection, MessageStatus } from '../../entities/message.entity';
import { Contact } from '../../entities/contact.entity';
import { TwilioService } from '../twilio/twilio.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { SendSmsDto, ListMessagesDto } from './dto/messages.dto';
import { paginate, getPaginationOffset } from '../../common/utils/pagination.util';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    @InjectQueue('messages') private readonly msgQueue: Queue,
    private readonly twilioService: TwilioService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async send(organizationId: string, userId: string, dto: SendSmsDto) {
    const message = this.msgRepo.create({
      organizationId,
      fromNumber: dto.from,
      toNumber: dto.to,
      body: dto.body,
      direction: MessageDirection.OUTBOUND,
      status: dto.scheduledAt ? MessageStatus.SCHEDULED : MessageStatus.QUEUED,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      templateId: dto.templateId,
    });

    // Find or create contact
    let contact = await this.contactRepo.findOne({
      where: { organizationId, phone: dto.to },
    });
    if (contact) message.contactId = contact.id;

    await this.msgRepo.save(message);

    if (dto.scheduledAt) {
      const delay = new Date(dto.scheduledAt).getTime() - Date.now();
      await this.msgQueue.add('send', { messageId: message.id, organizationId }, { delay: Math.max(0, delay) });
    } else {
      await this.msgQueue.add('send', { messageId: message.id, organizationId });
    }

    return message;
  }

  async sendImmediate(organizationId: string, messageId: string) {
    const message = await this.msgRepo.findOne({ where: { id: messageId, organizationId } });
    if (!message) return;

    try {
      const client = await this.twilioService.getClient(organizationId);
      const sent = await client.messages.create({
        from: message.fromNumber,
        to: message.toNumber,
        body: message.body,
        statusCallback: `${process.env.APP_URL}/api/webhooks/twilio/sms/status?orgId=${organizationId}`,
      });

      await this.msgRepo.update(message.id, {
        status: MessageStatus.SENT,
        twilioSid: sent.sid,
        sentAt: new Date(),
      });
    } catch (err) {
      await this.msgRepo.update(message.id, {
        status: MessageStatus.FAILED,
        errorMessage: err.message,
        errorCode: String(err.code),
      });
    }
  }

  async findAll(organizationId: string, query: ListMessagesDto) {
    const { page = 1, limit = 50, search, direction, status, contactId, fromNumber } = query;
    const { skip, take } = getPaginationOffset(page, limit);

    const where: any = { organizationId };
    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (contactId) where.contactId = contactId;
    if (fromNumber) where.fromNumber = fromNumber;

    const [data, total] = await this.msgRepo.findAndCount({
      where: search ? [
        { ...where, body: ILike(`%${search}%`) },
        { ...where, toNumber: ILike(`%${search}%`) },
        { ...where, fromNumber: ILike(`%${search}%`) },
      ] : where,
      order: { createdAt: 'DESC' },
      skip,
      take,
    });

    return paginate(data, total, page, limit);
  }

  async getConversation(organizationId: string, contactId: string, page = 1, limit = 50) {
    const { skip, take } = getPaginationOffset(page, limit);
    const [data, total] = await this.msgRepo.findAndCount({
      where: { organizationId, contactId },
      order: { createdAt: 'ASC' },
      skip,
      take,
    });
    return paginate(data, total, page, limit);
  }

  async handleIncoming(organizationId: string, twilioPayload: any) {
    const contact = await this.contactRepo.findOne({
      where: { organizationId, phone: twilioPayload.From },
    });

    const message = this.msgRepo.create({
      organizationId,
      contactId: contact?.id,
      fromNumber: twilioPayload.From,
      toNumber: twilioPayload.To,
      body: twilioPayload.Body,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.RECEIVED,
      twilioSid: twilioPayload.MessageSid,
      numMedia: parseInt(twilioPayload.NumMedia || '0'),
    });
    await this.msgRepo.save(message);

    // Emit real-time event to organization
    this.eventsGateway.emitToOrg(organizationId, 'message:new', {
      message,
      contact,
    });

    return message;
  }

  async updateStatus(twilioSid: string, status: string) {
    const message = await this.msgRepo.findOne({ where: { twilioSid } });
    if (!message) return;

    const statusMap: Record<string, MessageStatus> = {
      queued: MessageStatus.QUEUED,
      sending: MessageStatus.SENDING,
      sent: MessageStatus.SENT,
      delivered: MessageStatus.DELIVERED,
      failed: MessageStatus.FAILED,
      undelivered: MessageStatus.UNDELIVERED,
    };

    await this.msgRepo.update(message.id, {
      status: statusMap[status] || message.status,
      ...(status === 'delivered' && { deliveredAt: new Date() }),
    });
  }

  async markRead(organizationId: string, messageId: string) {
    await this.msgRepo.update({ id: messageId, organizationId }, { isRead: true, readAt: new Date() });
  }

  async getStats(organizationId: string) {
    const [sent, received, failed, delivered] = await Promise.all([
      this.msgRepo.count({ where: { organizationId, direction: MessageDirection.OUTBOUND } }),
      this.msgRepo.count({ where: { organizationId, direction: MessageDirection.INBOUND } }),
      this.msgRepo.count({ where: { organizationId, status: MessageStatus.FAILED } }),
      this.msgRepo.count({ where: { organizationId, status: MessageStatus.DELIVERED } }),
    ]);
    return { sent, received, failed, delivered };
  }
}
