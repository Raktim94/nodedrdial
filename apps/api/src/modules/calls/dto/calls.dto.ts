import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CallDirection, CallStatus } from '../../../entities/call.entity';

export class MakeCallDto {
  @ApiProperty() @IsString() to: string;
  @ApiProperty() @IsString() from: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() record?: boolean;
}

export class ListCallsDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number = 1;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber() @Max(200) limit?: number = 50;
  @ApiPropertyOptional({ enum: CallDirection }) @IsOptional() @IsEnum(CallDirection) direction?: CallDirection;
  @ApiPropertyOptional({ enum: CallStatus }) @IsOptional() @IsEnum(CallStatus) status?: CallStatus;
}

export class UpdateCallDto {
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
  @ApiPropertyOptional() @IsOptional() tags?: string[];
}
