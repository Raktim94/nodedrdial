import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CallsService } from './calls.service';
import { MakeCallDto, ListCallsDto, UpdateCallDto } from './dto/calls.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('calls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post()
  @ApiOperation({ summary: 'Initiate an outbound call' })
  makeCall(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: MakeCallDto) {
    return this.callsService.makeCall(orgId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List call history' })
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: ListCallsDto) {
    return this.callsService.findAll(orgId, query);
  }

  @Get('stats')
  getStats(@CurrentUser('organizationId') orgId: string) {
    return this.callsService.getStats(orgId);
  }

  @Get(':id')
  findOne(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.callsService.findOne(orgId, id);
  }

  @Put(':id')
  updateCall(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateCallDto) {
    return this.callsService.updateCall(orgId, id, dto);
  }

  @Post(':id/hangup')
  @ApiOperation({ summary: 'Hang up an active call' })
  hangup(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.callsService.hangup(orgId, id);
  }
}
