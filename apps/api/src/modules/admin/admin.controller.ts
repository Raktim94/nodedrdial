import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview') getOverview() { return this.adminService.getSystemOverview(); }
  @Get('organizations') getOrgs(@Query('page') p?: number, @Query('limit') l?: number) { return this.adminService.getAllOrganizations(p, l); }
  @Get('users') getUsers(@Query('page') p?: number, @Query('limit') l?: number) { return this.adminService.getAllUsers(p, l); }
  @Get('dealers') getDealers() { return this.adminService.getAllDealers(); }
  @Get('audit-logs') getAuditLogs(@Query('page') p?: number, @Query('limit') l?: number) { return this.adminService.getAuditLogs(p, l); }

  @Post('organizations/:id/toggle')
  toggleOrg(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.adminService.toggleOrganization(id, isActive);
  }
}
