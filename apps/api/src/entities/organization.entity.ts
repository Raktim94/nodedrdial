import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Dealer } from './dealer.entity';

@Entity('organizations')
@Index(['slug'], { unique: true })
@Index(['dealerId'])
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'dealer_id', nullable: true })
  dealerId: string;

  @ManyToOne(() => Dealer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dealer_id' })
  dealer: Dealer;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ default: 'starter' })
  plan: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ name: 'address_line1', nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ type: 'jsonb', default: {} })
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    companyName?: string;
    loginBg?: string;
  };

  @Column({ name: 'max_users', default: 5 })
  maxUsers: number;

  @Column({ name: 'max_phone_numbers', default: 3 })
  maxPhoneNumbers: number;

  @Column({ name: 'suspended_at', type: 'timestamp', nullable: true })
  suspendedAt: Date;

  @Column({ name: 'suspended_reason', nullable: true })
  suspendedReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
