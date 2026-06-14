import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessagesProcessor } from './messages.processor';
import { Message } from '../../entities/message.entity';
import { Contact } from '../../entities/contact.entity';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Contact]),
    BullModule.registerQueue({ name: 'messages' }),
    TwilioModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesProcessor],
  exports: [MessagesService],
})
export class MessagesModule {}
