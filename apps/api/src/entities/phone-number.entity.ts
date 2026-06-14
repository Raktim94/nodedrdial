import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, Index,
} from 'typeorm';

export enum PhoneNumberType {
  LOCAL = 'local',
  TOLL_FREE = 'toll_free',
  MOBILE = 'mobile',
  VOIP = 'voip',
}

@Entity('phone_numbers')
@Index(['organizationId'])
@Index(['phoneNumber'])
export class PhoneNumber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'friendly_name', nullable: true })
  friendlyName: string;

  @Column({ name: 'twilio_sid', nullable: true })
  twilioSid: string;

  @Column({ type: 'enum', enum: PhoneNumberType, default: PhoneNumberType.LOCAL })
  type: PhoneNumberType;

  @Column({ type: 'jsonb', default: { sms: false, voice: false, mms: false } })
  capabilities: { sms: boolean; voice: boolean; mms: boolean };

  @Column({ name: 'sms_url', nullable: true })
  smsUrl: string;

  @Column({ name: 'voice_url', nullable: true })
  voiceUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  label: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
