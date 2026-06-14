import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SetupService } from './setup.service';
import { SetupDto } from './dto/setup.dto';

@ApiTags('setup')
@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check if initial setup is complete' })
  getStatus() {
    return this.setupService.getStatus();
  }

  @Post()
  @ApiOperation({ summary: 'Run initial setup wizard' })
  runSetup(@Body() dto: SetupDto) {
    return this.setupService.runSetup(dto);
  }
}
