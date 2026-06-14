import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService, InviteUserDto, UpdateUserDto } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.MANAGER, UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  findAll(@CurrentUser('organizationId') orgId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.usersService.findAll(orgId, page, limit);
  }

  @Post('invite')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  invite(@CurrentUser('organizationId') orgId: string, @Body() dto: InviteUserDto) {
    return this.usersService.invite(orgId, dto);
  }

  @Get(':id')
  findOne(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.usersService.findOne(id, orgId);
  }

  @Put(':id')
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto, orgId);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  deactivate(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.usersService.deactivate(id, orgId);
  }

  @Post(':id/activate')
  @Roles(UserRole.ORG_OWNER, UserRole.SUPER_ADMIN)
  activate(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.usersService.activate(id, orgId);
  }
}
