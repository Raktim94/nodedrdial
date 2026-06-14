import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum CallStatus {
  QUEUED = 'queued',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BUSY = 'busy',
  NO_ANSWER = 'no-answer',
  CANCELED = 'canceled',
}

@Entity('calls')
@Index(['organizationId', 'createdAt'])
@Index(['contactId'])
@Index(['twilioSid'])
export class Call {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'contact_id', nullable: true })
  contactId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column({ name: 'from_number' })
  fromNumber: string;

  @Column({ name: 'to_number' })
  toNumber: string;

  @Column({ type: 'enum', enum: CallDirection })
  direction: CallDirection;

  @Column({ type: 'enum', enum: CallStatus, default: CallStatus.QUEUED })
  status: CallStatus;

  @Column({ name: 'twilio_sid', nullable: true })
  twilioSid: string;

  @Column({ nullable: true })
  duration: number;

  @Column({ nullable: true })
  price: string;

  @Column({ name: 'price_unit', nullable: true })
  priceUnit: string;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', type: 'timestamp', nullable: true })
  endedAt: Date;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ name: 'recording_sid', nullable: true })
  recordingSid: string;

  @Column({ name: 'recording_duration', nullable: true })
  recordingDuration: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ name: 'answered_by', nullable: true })
  answeredBy: string;

  @Column({ name: 'caller_name', nullable: true })
  callerName: string;

  @Column({ name: 'hangup_by', nullable: true })
  hangupBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
