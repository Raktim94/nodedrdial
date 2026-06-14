import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from '../../entities/notification.entity';
import { EventsGateway } from '../../gateways/events.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(userId: string, orgId: string, type: NotificationType, title: string, message: string, data?: any) {
    const notif = await this.notifRepo.save(
      this.notifRepo.create({ userId, organizationId: orgId, type, title, message, data }),
    );
    this.eventsGateway.emitToUser(userId, 'notification:new', notif);
    return notif;
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const [data, total] = await this.notifRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    const unread = await this.notifRepo.count({ where: { userId, isRead: false } });
    return { data, total, unread };
  }

  async markRead(userId: string, id?: string) {
    const where: any = { userId, isRead: false };
    if (id) where.id = id;
    await this.notifRepo.update(where, { isRead: true, readAt: new Date() });
    return { message: 'Marked as read' };
  }
}
