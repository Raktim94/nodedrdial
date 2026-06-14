import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveCredentialsDto {
  @ApiProperty()
  @IsString()
  accountSid: string;

  @ApiProperty()
  @IsString()
  authToken: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apiSecret?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  twimlAppSid?: string;
}

export class TestConnectionDto {}

export class MakeCallDto {
  @ApiProperty()
  @IsString()
  to: string;

  @ApiProperty()
  @IsString()
  from: string;
}
