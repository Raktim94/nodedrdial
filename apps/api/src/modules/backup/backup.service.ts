import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = '/app/backups';

  constructor(private readonly config: ConfigService) {}

  @Cron('0 2 * * *') // 2 AM daily
  async scheduledBackup() {
    await this.createBackup();
  }

  async createBackup(): Promise<{ filename: string; path: string; size: number }> {
    if (!fs.existsSync(this.backupDir)) fs.mkdirSync(this.backupDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `twiliohub_${timestamp}.sql.gz`;
    const filePath = path.join(this.backupDir, filename);

    const host = this.config.get('POSTGRES_HOST', 'postgres');
    const db = this.config.get('POSTGRES_DB', 'twiliohub');
    const user = this.config.get('POSTGRES_USER', 'twiliohub');
    const pass = this.config.get('POSTGRES_PASSWORD', '');

    try {
      execSync(
        `PGPASSWORD="${pass}" pg_dump -h ${host} -U ${user} -d ${db} | gzip > ${filePath}`,
        { stdio: 'pipe' },
      );
      const stats = fs.statSync(filePath);
      this.logger.log(`Backup created: ${filename} (${stats.size} bytes)`);
      return { filename, path: filePath, size: stats.size };
    } catch (err) {
      this.logger.error(`Backup failed: ${err.message}`);
      throw err;
    }
  }

  async listBackups() {
    if (!fs.existsSync(this.backupDir)) return [];
    return fs
      .readdirSync(this.backupDir)
      .filter((f) => f.endsWith('.sql.gz'))
      .map((filename) => {
        const stats = fs.statSync(path.join(this.backupDir, filename));
        return { filename, size: stats.size, createdAt: stats.birthtime };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteBackup(filename: string) {
    const filePath = path.join(this.backupDir, filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return { message: 'Backup deleted' };
  }
}
