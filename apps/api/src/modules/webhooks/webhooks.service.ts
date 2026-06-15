import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as crypto from 'crypto';
import * as Twilio from 'twilio';
import { Webhook, WebhookEvent, WebhookEventStatus } from '../../entities/webhook.entity';
import { MessagesService } from '../messages/messages.service';
import { CallsService } from '../calls/calls.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhooks.dto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(Webhook) private readonly webhookRepo: Repository<Webhook>,
    @InjectRepository(WebhookEvent) private readonly eventRepo: Repository<WebhookEvent>,
    private readonly messagesService: MessagesService,
    private readonly callsService: CallsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async handleIncomingSms(organizationId: string, payload: any) {
    const message = await this.messagesService.handleIncoming(organizationId, payload);
    await this.dispatch(organizationId, 'sms.received', { message, raw: payload });
    return message;
  }

  async handleSmsStatus(payload: any) {
    if (payload.MessageSid) {
      await this.messagesService.updateStatus(payload.MessageSid, payload.MessageStatus);
    }
  }

  async handleIncomingVoice(organizationId: string, payload: any): Promise<string> {
    await this.callsService.handleIncoming(organizationId, payload);

    const twiml = new Twilio.twiml.VoiceResponse();

    // Outbound call initiated from browser via TwiML App
    if (payload.Direction === 'outbound-api' || (payload.To && !payload.To.startsWith('client:'))) {
      const dial = twiml.dial({ callerId: payload.From });
      dial.number(payload.To);
    } else {
      // Inbound phone call — ring the browser softphone for this org
      const dial = twiml.dial();
      dial.client(organizationId);
    }

    return twiml.toString();
  }

  async handleVoiceStatus(payload: any, organizationId: string) {
    if (payload.CallSid) {
      await this.callsService.updateStatus(payload.CallSid, payload.CallStatus, {
        duration: parseInt(payload.CallDuration || '0'),
        price: payload.Price,
      });
    }
    await this.dispatch(organizationId, 'call.ended', payload);
  }

  async handleRecording(payload: any) {
    if (payload.CallSid) {
      await this.callsService.updateRecording(payload.CallSid, payload.RecordingUrl, payload.RecordingSid, parseInt(payload.RecordingDuration || '0'));
    }
  }

  async findAll(organizationId: string) {
    return this.webhookRepo.find({ where: { organizationId } });
  }

  async create(organizationId: string, dto: CreateWebhookDto) {
    const signingSecret = crypto.randomBytes(32).toString('hex');
    const webhook = this.webhookRepo.create({ ...dto, organizationId, signingSecret });
    return this.webhookRepo.save(webhook);
  }

  async update(organizationId: string, id: string, dto: UpdateWebhookDto) {
    await this.webhookRepo.update({ id, organizationId }, dto);
    return this.webhookRepo.findOne({ where: { id, organizationId } });
  }

  async remove(organizationId: string, id: string) {
    await this.webhookRepo.delete({ id, organizationId });
    return { message: 'Webhook deleted' };
  }

  async test(organizationId: string, id: string) {
    const webhook = await this.webhookRepo.findOne({ where: { id, organizationId } });
    if (!webhook) throw new NotFoundException('Webhook not found');

    const testPayload = { event: 'test', timestamp: new Date().toISOString(), organizationId };
    return this.send(webhook, 'test', testPayload);
  }

  private async dispatch(organizationId: string, event: string, payload: any) {
    const webhooks = await this.webhookRepo.find({
      where: { organizationId, isActive: true },
    });

    for (const webhook of webhooks) {
      if (!webhook.events.includes(event) && !webhook.events.includes('*')) continue;
      this.send(webhook, event, payload).catch(() => {});
    }
  }

  private async send(webhook: Webhook, event: string, payload: any) {
    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
    const signature = crypto
      .createHmac('sha256', webhook.signingSecret)
      .update(body)
      .digest('hex');

    const webEvent = this.eventRepo.create({
      webhookId: webhook.id,
      organizationId: webhook.organizationId,
      event,
      payload,
      status: WebhookEventStatus.PENDING,
    });
    await this.eventRepo.save(webEvent);

    try {
      const response = await axios.post(webhook.url, body, {
        headers: {
          'Content-Type': 'application/json',
          'X-TwilioHub-Signature': signature,
          'X-TwilioHub-Event': event,
        },
        timeout: 10000,
      });

      await this.eventRepo.update(webEvent.id, {
        status: WebhookEventStatus.SUCCESS,
        statusCode: response.status,
        response: response.data,
        completedAt: new Date(),
        attempts: 1,
      });
      await this.webhookRepo.increment({ id: webhook.id }, 'successCount', 1);
    } catch (err) {
      await this.eventRepo.update(webEvent.id, {
        status: WebhookEventStatus.FAILED,
        statusCode: err.response?.status,
        errorMessage: err.message,
        attempts: 1,
      });
      await this.webhookRepo.increment({ id: webhook.id }, 'failureCount', 1);
    }
  }
}
