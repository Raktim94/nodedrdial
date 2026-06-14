import {
  Controller, Get, Post, Body, Param, Query, Patch, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendSmsDto, ListMessagesDto } from './dto/messages.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send an SMS message' })
  send(@CurrentUser('organizationId') orgId: string, @CurrentUser('id') userId: string, @Body() dto: SendSmsDto) {
    return this.messagesService.send(orgId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List messages' })
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: ListMessagesDto) {
    return this.messagesService.findAll(orgId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Message statistics' })
  getStats(@CurrentUser('organizationId') orgId: string) {
    return this.messagesService.getStats(orgId);
  }

  @Get('conversation/:contactId')
  @ApiOperation({ summary: 'Get conversation with a contact' })
  getConversation(
    @CurrentUser('organizationId') orgId: string,
    @Param('contactId') contactId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagesService.getConversation(orgId, contactId, page, limit);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  markRead(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.messagesService.markRead(orgId, id);
  }
}
