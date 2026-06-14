import { IsString, IsOptional, IsEnum, IsArray, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CampaignTargetType } from '../../../entities/campaign.entity';

export class CreateCampaignDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() templateId?: string;
  @ApiProperty() @IsString() message: string;
  @ApiProperty() @IsString() fromNumber: string;
  @ApiPropertyOptional({ enum: CampaignTargetType }) @IsOptional() @IsEnum(CampaignTargetType) targetType?: CampaignTargetType;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) targetGroups?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) targetContacts?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tagFilter?: string[];
  @ApiPropertyOptional() @IsOptional() @IsDateString() scheduledAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(10) ratePerSecond?: number;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}

export class ListCampaignsDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Max(100) limit?: number = 20;
}
