import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('api-keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  findAll(@CurrentUser('organizationId') orgId: string) {
    return this.apiKeysService.findAll(orgId);
  }

  @Post()
  create(
    @CurrentUser('organizationId') orgId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { name: string; scopes: string[] },
  ) {
    return this.apiKeysService.create(orgId, userId, body.name, body.scopes || ['*']);
  }

  @Delete(':id')
  revoke(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.apiKeysService.revoke(orgId, id);
  }
}
