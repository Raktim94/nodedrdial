import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';

@Processor('campaigns')
export class CampaignsProcessor {
  private readonly logger = new Logger(CampaignsProcessor.name);

  constructor(private readonly campaignsService: CampaignsService) {}

  @Process('run')
  async handleRun(job: Job<{ campaignId: string; organizationId: string }>) {
    this.logger.log(`Running campaign ${job.data.campaignId}`);
    await this.campaignsService.runCampaign(job.data.organizationId, job.data.campaignId);
  }
}
