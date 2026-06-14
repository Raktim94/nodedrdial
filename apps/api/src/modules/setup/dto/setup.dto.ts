import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetupDto {
  @ApiProperty() @IsString() orgName: string;
  @ApiProperty() @IsEmail() adminEmail: string;
  @ApiProperty() @IsString() @MinLength(8) adminPassword: string;
  @ApiProperty() @IsString() adminFirstName: string;
  @ApiProperty() @IsString() adminLastName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() twilioAccountSid?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() twilioAuthToken?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() twilioApiKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() twilioApiSecret?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() twimlAppSid?: string;
}
