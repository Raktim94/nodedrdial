import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getDashboardStats(orgId);
  }

  @Get('messages/activity')
  getMessageActivity(@CurrentUser('organizationId') orgId: string, @Query('days') days?: number) {
    return this.analyticsService.getMessageActivity(orgId, days || 30);
  }

  @Get('calls/activity')
  getCallActivity(@CurrentUser('organizationId') orgId: string, @Query('days') days?: number) {
    return this.analyticsService.getCallActivity(orgId, days || 30);
  }

  @Get('contacts/top')
  getTopContacts(@CurrentUser('organizationId') orgId: string) {
    return this.analyticsService.getTopContacts(orgId);
  }
}
