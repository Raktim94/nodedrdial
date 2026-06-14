import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsProcessor } from './campaigns.processor';
import { Campaign } from '../../entities/campaign.entity';
import { Contact } from '../../entities/contact.entity';
import { Message } from '../../entities/message.entity';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, Contact, Message]),
    BullModule.registerQueue({ name: 'campaigns' }),
    TwilioModule,
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignsProcessor],
  exports: [CampaignsService],
})
export class CampaignsModule {}
