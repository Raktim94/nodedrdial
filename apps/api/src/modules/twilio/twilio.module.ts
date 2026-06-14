import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwilioController } from './twilio.controller';
import { TwilioService } from './twilio.service';
import { TwilioCredential } from '../../entities/twilio-credential.entity';
import { PhoneNumber } from '../../entities/phone-number.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TwilioCredential, PhoneNumber])],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
