import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('dealers')
@Index(['slug'], { unique: true })
export class Dealer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'owner_id', nullable: true })
  ownerId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ default: 'standard' })
  plan: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', default: {} })
  branding: {
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
    supportEmail?: string;
    customDomain?: string;
  };

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ name: 'max_organizations', default: 10 })
  maxOrganizations: number;

  @Column({ name: 'commission_percent', type: 'decimal', precision: 5, scale: 2, default: 0 })
  commissionPercent: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
