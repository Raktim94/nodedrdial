import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get('me')
  getMyOrg(@CurrentUser('organizationId') orgId: string) {
    return this.orgService.findOne(orgId);
  }

  @Put('me')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  updateMyOrg(@CurrentUser('organizationId') orgId: string, @Body() data: any) {
    return this.orgService.update(orgId, data);
  }

  @Put('me/branding')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  updateBranding(@CurrentUser('organizationId') orgId: string, @Body() branding: any) {
    return this.orgService.updateBranding(orgId, branding);
  }
}
