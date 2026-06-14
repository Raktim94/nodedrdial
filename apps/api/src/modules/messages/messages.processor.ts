import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Processor('messages')
export class MessagesProcessor {
  private readonly logger = new Logger(MessagesProcessor.name);

  constructor(private readonly messagesService: MessagesService) {}

  @Process('send')
  async handleSend(job: Job<{ messageId: string; organizationId: string }>) {
    this.logger.log(`Processing message job ${job.id}`);
    await this.messagesService.sendImmediate(job.data.organizationId, job.data.messageId);
  }
}
