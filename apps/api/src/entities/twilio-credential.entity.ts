import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

@Entity('twilio_credentials')
@Index(['organizationId'], { unique: true })
export class TwilioCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'account_sid_encrypted' })
  accountSidEncrypted: string;

  @Column({ name: 'auth_token_encrypted' })
  authTokenEncrypted: string;

  @Column({ name: 'api_key_encrypted', nullable: true })
  apiKeyEncrypted: string;

  @Column({ name: 'api_secret_encrypted', nullable: true })
  apiSecretEncrypted: string;

  @Column({ name: 'twiml_app_sid', nullable: true })
  twimlAppSid: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'last_checked_at', type: 'timestamp', nullable: true })
  lastCheckedAt: Date;

  @Column({ name: 'account_name', nullable: true })
  accountName: string;

  @Column({ name: 'account_status', nullable: true })
  accountStatus: string;

  @Column({ type: 'jsonb', nullable: true })
  usageThisMonth: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
