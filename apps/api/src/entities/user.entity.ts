import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Dealer } from './dealer.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  DEALER = 'dealer',
  ORG_OWNER = 'org_owner',
  MANAGER = 'manager',
  AGENT = 'agent',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['organizationId'])
@Index(['dealerId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  username: string;

  @Column()
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.AGENT })
  role: UserRole;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ name: 'dealer_id', nullable: true })
  dealerId: string;

  @ManyToOne(() => Dealer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'dealer_id' })
  dealer: Dealer;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({ name: 'two_factor_secret', nullable: true, select: false })
  twoFactorSecret: string;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true, select: false })
  emailVerificationToken: string;

  @Column({ name: 'password_reset_token', nullable: true, select: false })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true, select: false })
  passwordResetExpires: Date;

  @Column({ name: 'refresh_token', nullable: true, select: false })
  refreshToken: string;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', nullable: true })
  lastLoginIp: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, any>;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  timezone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
