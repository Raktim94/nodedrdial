import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { Call } from '../../entities/call.entity';
import { Contact } from '../../entities/contact.entity';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Call, Contact]), TwilioModule],
  controllers: [CallsController],
  providers: [CallsService],
  exports: [CallsService],
})
export class CallsModule {}
