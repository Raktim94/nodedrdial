import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum WebhookEventStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('webhooks')
@Index(['organizationId'])
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column()
  name: string;

  @Column()
  url: string;

  @Column({ type: 'simple-array' })
  events: string[];

  @Column({ name: 'signing_secret' })
  signingSecret: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_called_at', type: 'timestamp', nullable: true })
  lastCalledAt: Date;

  @Column({ name: 'failure_count', default: 0 })
  failureCount: number;

  @Column({ name: 'success_count', default: 0 })
  successCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('webhook_events')
@Index(['webhookId'])
@Index(['organizationId', 'createdAt'])
@Index(['status'])
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'webhook_id' })
  webhookId: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column()
  event: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  response: Record<string, any>;

  @Column({ name: 'status_code', nullable: true })
  statusCode: number;

  @Column({ name: 'attempts', default: 0 })
  attempts: number;

  @Column({ name: 'next_retry_at', type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'enum', enum: WebhookEventStatus, default: WebhookEventStatus.PENDING })
  status: WebhookEventStatus;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
