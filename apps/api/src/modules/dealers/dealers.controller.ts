import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DealersService } from './dealers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('dealers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dealers')
export class DealersController {
  constructor(private readonly dealersService: DealersService) {}

  @Get('me')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  getMyDealer(@CurrentUser('dealerId') dealerId: string) {
    return this.dealersService.findMyDealer(dealerId);
  }

  @Get('me/organizations')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  getMyOrganizations(@CurrentUser('dealerId') dealerId: string) {
    return this.dealersService.getOrganizations(dealerId);
  }

  @Post('me/organizations')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  createOrganization(@CurrentUser('dealerId') dealerId: string, @Body() data: any) {
    return this.dealersService.createOrganization(dealerId, data);
  }

  @Post('me/organizations/:orgId/suspend')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  suspend(@CurrentUser('dealerId') dealerId: string, @Param('orgId') orgId: string, @Body('reason') reason: string) {
    return this.dealersService.suspendOrganization(dealerId, orgId, reason);
  }

  @Put('me/branding')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  updateBranding(@CurrentUser('dealerId') dealerId: string, @Body() branding: any) {
    return this.dealersService.update(dealerId, { branding });
  }

  // Alias routes for frontend dealer portal
  @Get('organizations')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  getOrganizations(@CurrentUser('dealerId') dealerId: string) {
    return this.dealersService.getOrganizations(dealerId);
  }

  @Get('stats')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  getStats(@CurrentUser('dealerId') dealerId: string) {
    return this.dealersService.getDealerStats(dealerId);
  }

  @Post('organizations')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  createOrg(@CurrentUser('dealerId') dealerId: string, @Body() data: any) {
    return this.dealersService.createOrganization(dealerId, data);
  }

  @Patch('organizations/:orgId/toggle')
  @Roles(UserRole.DEALER, UserRole.SUPER_ADMIN)
  toggleOrg(
    @CurrentUser('dealerId') dealerId: string,
    @Param('orgId') orgId: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.dealersService.toggleOrganization(dealerId, orgId, isActive);
  }
}
