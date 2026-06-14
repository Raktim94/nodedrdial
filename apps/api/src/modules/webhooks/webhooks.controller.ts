import {
  Controller, Post, Body, Query, Req, Res, HttpStatus, UseGuards,
  Get, Param, Delete, Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhooks.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserRole } from '../../entities/user.entity';
import { Public } from '../../common/guards/jwt-auth.guard';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  // ── Twilio Incoming Webhooks (Public) ──────────────────────
  @Post('twilio/sms')
  @Public()
  @ApiExcludeEndpoint()
  async incomingSms(@Body() body: any, @Query('orgId') orgId: string, @Res() res: Response) {
    if (!orgId) return res.status(HttpStatus.BAD_REQUEST).send();
    await this.webhooksService.handleIncomingSms(orgId, body);
    res.setHeader('Content-Type', 'text/xml');
    res.status(HttpStatus.OK).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>');
  }

  @Post('twilio/sms/status')
  @Public()
  @ApiExcludeEndpoint()
  async smsStatus(@Body() body: any, @Query('orgId') orgId: string) {
    await this.webhooksService.handleSmsStatus(body);
    return { received: true };
  }

  @Post('twilio/voice')
  @Public()
  @ApiExcludeEndpoint()
  async incomingVoice(@Body() body: any, @Query('orgId') orgId: string, @Res() res: Response) {
    const twiml = await this.webhooksService.handleIncomingVoice(orgId, body);
    res.setHeader('Content-Type', 'text/xml');
    res.status(HttpStatus.OK).send(twiml);
  }

  @Post('twilio/voice/status')
  @Public()
  @ApiExcludeEndpoint()
  async voiceStatus(@Body() body: any, @Query('orgId') orgId: string) {
    await this.webhooksService.handleVoiceStatus(body, orgId);
    return { received: true };
  }

  @Post('twilio/recording')
  @Public()
  @ApiExcludeEndpoint()
  async recordingStatus(@Body() body: any) {
    await this.webhooksService.handleRecording(body);
    return { received: true };
  }

  // ── User-configured Outgoing Webhooks ────────────────────
  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List webhooks' })
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.webhooksService.findAll(orgId);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create webhook' })
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateWebhookDto) {
    return this.webhooksService.create(orgId, dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateWebhookDto) {
    return this.webhooksService.update(orgId, id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.webhooksService.remove(orgId, id);
  }

  @Post(':id/test')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  test(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.webhooksService.test(orgId, id);
  }
}
