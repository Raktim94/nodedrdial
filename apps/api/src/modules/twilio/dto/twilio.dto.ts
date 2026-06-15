import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveCredentialsDto {
  @ApiProperty({ description: 'Twilio Account SID (starts with AC)' })
  @IsString()
  accountSid: string;

  @ApiPropertyOptional({
    description: 'Auth Token — Case 1: local testing only. Not recommended for production. ' +
      'If compromised, your entire Twilio account is at risk.',
  })
  @IsOptional()
  @IsString()
  authToken?: string;

  @ApiPropertyOptional({
    description: 'API Key SID (starts with SK) — Case 2: recommended for production. ' +
      'Can be revoked independently without affecting other credentials.',
  })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({
    description: 'API Key Secret — required when using API Key (Case 2).',
  })
  @IsOptional()
  @IsString()
  apiSecret?: string;

  @ApiPropertyOptional({ description: 'TwiML App SID (starts with AP) — required for browser voice calling.' })
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
