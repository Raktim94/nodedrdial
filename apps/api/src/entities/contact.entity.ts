import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

@Entity('contacts')
@Index(['organizationId'])
@Index(['phone'])
@Index(['email'])
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  company: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'simple-array', default: '' })
  tags: string[];

  @Column({ name: 'custom_fields', type: 'jsonb', default: {} })
  customFields: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_opted_out', default: false })
  isOptedOut: boolean;

  @Column({ name: 'opted_out_at', type: 'timestamp', nullable: true })
  optedOutAt: Date;

  @Column({ name: 'last_contacted_at', type: 'timestamp', nullable: true })
  lastContactedAt: Date;

  @Column({ name: 'message_count', default: 0 })
  messageCount: number;

  @Column({ name: 'call_count', default: 0 })
  callCount: number;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  timezone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
