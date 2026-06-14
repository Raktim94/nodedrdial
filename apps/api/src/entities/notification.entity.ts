import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  MISSED_CALL = 'missed_call',
  CAMPAIGN_COMPLETED = 'campaign_completed',
  USER_INVITATION = 'user_invitation',
  SYSTEM_ALERT = 'system_alert',
  TWILIO_ERROR = 'twilio_error',
  WEBHOOK_FAILURE = 'webhook_failure',
}

@Entity('notifications')
@Index(['userId'])
@Index(['organizationId'])
@Index(['isRead'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
