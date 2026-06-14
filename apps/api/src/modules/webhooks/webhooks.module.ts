import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { Webhook, WebhookEvent } from '../../entities/webhook.entity';
import { MessagesModule } from '../messages/messages.module';
import { CallsModule } from '../calls/calls.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Webhook, WebhookEvent]),
    forwardRef(() => MessagesModule),
    forwardRef(() => CallsModule),
  ],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
