import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TwilioService } from './twilio.service';
import { SaveCredentialsDto } from './dto/twilio.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('twilio')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get Twilio connection status' })
  getStatus(@CurrentUser('organizationId') orgId: string) {
    return this.twilioService.getCredentialStatus(orgId);
  }

  @Post('credentials')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Save Twilio credentials' })
  saveCredentials(@CurrentUser('organizationId') orgId: string, @Body() dto: SaveCredentialsDto) {
    return this.twilioService.saveCredentials(orgId, dto);
  }

  @Post('test')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Test Twilio connection' })
  testConnection(@CurrentUser('organizationId') orgId: string) {
    return this.twilioService.testConnection(orgId);
  }

  @Get('phone-numbers')
  @ApiOperation({ summary: 'Get organization phone numbers' })
  getPhoneNumbers(@CurrentUser('organizationId') orgId: string) {
    return this.twilioService.getPhoneNumbers(orgId);
  }

  @Post('phone-numbers/sync')
  @Roles(UserRole.ORG_OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Sync phone numbers from Twilio' })
  syncPhoneNumbers(@CurrentUser('organizationId') orgId: string) {
    return this.twilioService.syncPhoneNumbers(orgId);
  }

  @Get('voice-token')
  @ApiOperation({ summary: 'Get Twilio Voice access token for browser calling' })
  getVoiceToken(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.twilioService.generateVoiceToken(orgId, userId);
  }

  @Get('usage')
  @Roles(UserRole.ORG_OWNER, UserRole.MANAGER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get Twilio usage statistics' })
  getUsage(@CurrentUser('organizationId') orgId: string) {
    return this.twilioService.getUsageStats(orgId);
  }
}
