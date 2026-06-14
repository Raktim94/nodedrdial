import { IsString, IsArray, IsBoolean, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateWebhookDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsUrl() url: string;
  @ApiProperty({ example: ['sms.received', 'call.ended'] }) @IsArray() @IsString({ each: true }) events: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {}
