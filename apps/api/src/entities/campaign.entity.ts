import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum CampaignTargetType {
  ALL = 'all',
  GROUPS = 'groups',
  INDIVIDUAL = 'individual',
}

@Entity('campaigns')
@Index(['organizationId'])
@Index(['status'])
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'created_by_id' })
  createdById: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'from_number' })
  fromNumber: string;

  @Column({ name: 'target_type', type: 'enum', enum: CampaignTargetType, default: CampaignTargetType.ALL })
  targetType: CampaignTargetType;

  @Column({ name: 'target_groups', type: 'simple-array', nullable: true })
  targetGroups: string[];

  @Column({ name: 'target_contacts', type: 'simple-array', nullable: true })
  targetContacts: string[];

  @Column({ name: 'tag_filter', type: 'simple-array', nullable: true })
  tagFilter: string[];

  @Column({ name: 'scheduled_at', type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ name: 'total_contacts', default: 0 })
  totalContacts: number;

  @Column({ name: 'sent_count', default: 0 })
  sentCount: number;

  @Column({ name: 'delivered_count', default: 0 })
  deliveredCount: number;

  @Column({ name: 'failed_count', default: 0 })
  failedCount: number;

  @Column({ name: 'opt_out_count', default: 0 })
  optOutCount: number;

  @Column({ name: 'rate_per_second', default: 1 })
  ratePerSecond: number;

  @Column({ name: 'error_message', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
