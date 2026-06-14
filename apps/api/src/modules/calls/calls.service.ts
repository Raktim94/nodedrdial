import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallDirection, CallStatus } from '../../entities/call.entity';
import { Contact } from '../../entities/contact.entity';
import { TwilioService } from '../twilio/twilio.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { MakeCallDto, ListCallsDto, UpdateCallDto } from './dto/calls.dto';
import { paginate, getPaginationOffset } from '../../common/utils/pagination.util';

@Injectable()
export class CallsService {
  constructor(
    @InjectRepository(Call) private readonly callRepo: Repository<Call>,
    @InjectRepository(Contact) private readonly contactRepo: Repository<Contact>,
    private readonly twilioService: TwilioService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async makeCall(organizationId: string, userId: string, dto: MakeCallDto) {
    const client = await this.twilioService.getClient(organizationId);
    const appUrl = process.env.APP_URL;

    const contact = await this.contactRepo.findOne({ where: { organizationId, phone: dto.to } });

    const twilioCall = await client.calls.create({
      from: dto.from,
      to: dto.to,
      url: `${appUrl}/api/webhooks/twilio/voice?orgId=${organizationId}`,
      statusCallback: `${appUrl}/api/webhooks/twilio/voice/status?orgId=${organizationId}`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      record: dto.record || false,
      recordingStatusCallback: `${appUrl}/api/webhooks/twilio/recording`,
    });

    const call = this.callRepo.create({
      organizationId,
      userId,
      contactId: contact?.id,
      fromNumber: dto.from,
      toNumber: dto.to,
      direction: CallDirection.OUTBOUND,
      status: CallStatus.QUEUED,
      twilioSid: twilioCall.sid,
    });
    return this.callRepo.save(call);
  }

  async findAll(organizationId: string, query: ListCallsDto) {
    const { page = 1, limit = 50, direction, status } = query;
    const { skip, take } = getPaginationOffset(page, limit);

    const where: any = { organizationId };
    if (direction) where.direction = direction;
    if (status) where.status = status;

    const [data, total] = await this.callRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip, take,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(organizationId: string, id: string) {
    const call = await this.callRepo.findOne({ where: { id, organizationId } });
    if (!call) throw new NotFoundException('Call not found');
    return call;
  }

  async updateCall(organizationId: string, id: string, dto: UpdateCallDto) {
    await this.callRepo.update({ id, organizationId }, dto);
    return this.findOne(organizationId, id);
  }

  async handleIncoming(organizationId: string, payload: any) {
    const contact = await this.contactRepo.findOne({
      where: { organizationId, phone: payload.From },
    });

    const call = this.callRepo.create({
      organizationId,
      contactId: contact?.id,
      fromNumber: payload.From,
      toNumber: payload.To,
      direction: CallDirection.INBOUND,
      status: CallStatus.RINGING,
      twilioSid: payload.CallSid,
      callerName: payload.CallerName,
    });
    await this.callRepo.save(call);

    this.eventsGateway.emitToOrg(organizationId, 'call:incoming', {
      call,
      contact,
    });
    return call;
  }

  async updateStatus(twilioSid: string, status: string, extra?: { duration?: number; price?: string }) {
    const call = await this.callRepo.findOne({ where: { twilioSid } });
    if (!call) return;

    const statusMap: Record<string, CallStatus> = {
      queued: CallStatus.QUEUED,
      ringing: CallStatus.RINGING,
      'in-progress': CallStatus.IN_PROGRESS,
      completed: CallStatus.COMPLETED,
      failed: CallStatus.FAILED,
      busy: CallStatus.BUSY,
      'no-answer': CallStatus.NO_ANSWER,
      canceled: CallStatus.CANCELED,
    };

    const updates: Partial<Call> = {
      status: statusMap[status] || call.status,
    };

    if (status === 'in-progress' && !call.startedAt) updates.startedAt = new Date();
    if (status === 'completed') {
      updates.endedAt = new Date();
      if (extra?.duration) updates.duration = extra.duration;
      if (extra?.price) updates.price = extra.price;
    }

    await this.callRepo.update(call.id, updates);

    this.eventsGateway.emitToOrg(call.organizationId, 'call:status', {
      callId: call.id, twilioSid, status,
    });
  }

  async updateRecording(twilioSid: string, recordingUrl: string, recordingSid: string, duration: number) {
    await this.callRepo.update({ twilioSid }, { recordingUrl, recordingSid, recordingDuration: duration });
  }

  async hangup(organizationId: string, callId: string) {
    const call = await this.findOne(organizationId, callId);
    const client = await this.twilioService.getClient(organizationId);
    await client.calls(call.twilioSid).update({ status: 'completed' });
    return { message: 'Call ended' };
  }

  async getStats(organizationId: string) {
    const [total, inbound, outbound, completed, missed] = await Promise.all([
      this.callRepo.count({ where: { organizationId } }),
      this.callRepo.count({ where: { organizationId, direction: CallDirection.INBOUND } }),
      this.callRepo.count({ where: { organizationId, direction: CallDirection.OUTBOUND } }),
      this.callRepo.count({ where: { organizationId, status: CallStatus.COMPLETED } }),
      this.callRepo.count({ where: { organizationId, status: CallStatus.NO_ANSWER } }),
    ]);
    return { total, inbound, outbound, completed, missed };
  }
}
