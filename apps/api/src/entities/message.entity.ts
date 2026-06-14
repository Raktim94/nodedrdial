import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageStatus {
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RECEIVED = 'received',
  UNDELIVERED = 'undelivered',
  SCHEDULED = 'scheduled',
}

@Entity('messages')
@Index(['organizationId', 'createdAt'])
@Index(['contactId'])
@Index(['fromNumber'])
@Index(['toNumber'])
@Index(['campaignId'])
@Index(['twilioSid'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @Column({ name: 'from_number' })
  fromNumber: string;

  @Column({ name: 'to_number' })
  toNumber: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'enum', enum: MessageDirection })
  direction: MessageDirection;

  @Column({ type: 'enum', enum: MessageStatus, default: MessageStatus.QUEUED })
  status: MessageStatus;

  @Column({ name: 'twilio_sid', nullable: true })
  twilioSid: string;

  @Column({ name: 'campaign_id', nullable: true })
  campaignId: string;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ name: 'error_code', nullable: true })
  errorCode: string;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @Column({ name: 'num_segments', default: 1 })
  numSegments: number;

  @Column({ name: 'num_media', default: 0 })
  numMedia: number;

  @Column({ name: 'media_urls', type: 'simple-array', nullable: true })
  mediaUrls: string[];

  @Column({ name: 'price', nullable: true })
  price: string;

  @Column({ name: 'price_unit', nullable: true })
  priceUnit: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
