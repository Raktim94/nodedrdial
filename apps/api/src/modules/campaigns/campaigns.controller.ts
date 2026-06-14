import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto, ListCampaignsDto } from './dto/campaigns.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('campaigns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  create(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(orgId, userId, dto);
  }

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: ListCampaignsDto) {
    return this.campaignsService.findAll(orgId, query);
  }

  @Get(':id')
  findOne(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.campaignsService.findOne(orgId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get campaign analytics' })
  getStats(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.campaignsService.getStats(orgId, id);
  }

  @Put(':id')
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(orgId, id, dto);
  }

  @Post(':id/launch')
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  launch(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.campaignsService.launch(orgId, id);
  }

  @Post(':id/pause')
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  pause(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.campaignsService.pause(orgId, id);
  }

  @Post(':id/cancel')
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  cancel(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.campaignsService.cancel(orgId, id);
  }

  @Delete(':id')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.campaignsService.remove(orgId, id);
  }
}
