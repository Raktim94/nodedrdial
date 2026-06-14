import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/user.entity';

@ApiTags('backup')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin/backups')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get() listBackups() { return this.backupService.listBackups(); }
  @Post() createBackup() { return this.backupService.createBackup(); }
  @Delete(':filename') deleteBackup(@Param('filename') filename: string) { return this.backupService.deleteBackup(filename); }
}
