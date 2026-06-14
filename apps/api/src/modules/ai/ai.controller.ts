import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

class SuggestReplyDto {
  @IsString() message: string;
  @IsOptional() @IsString() contactName?: string;
}

class GenerateCampaignDto {
  @IsString() productName: string;
  @IsString() offer: string;
  @IsEnum(['professional', 'casual', 'urgent']) tone: 'professional' | 'casual' | 'urgent';
}

class SummarizeDto {
  @IsArray() @IsString({ each: true }) messages: string[];
}

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-reply')
  suggestReply(@Body() dto: SuggestReplyDto) {
    return this.aiService.suggestReply(dto.message, dto.contactName);
  }

  @Post('generate-campaign')
  generateCampaign(@Body() dto: GenerateCampaignDto) {
    return this.aiService.generateCampaignMessage(dto);
  }

  @Post('summarize')
  summarize(@Body() dto: SummarizeDto) {
    return this.aiService.summarizeConversation(dto.messages);
  }
}
