import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Message } from '../../entities/message.entity';
import { Call } from '../../entities/call.entity';
import { Contact } from '../../entities/contact.entity';
import { Campaign } from '../../entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Call, Contact, Campaign])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
