import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FilesService {
  constructor(private readonly config: ConfigService) {}

  getFileUrl(filename: string): string {
    return `${this.config.get('APP_URL')}/uploads/${filename}`;
  }

  async deleteFile(filename: string): Promise<void> {
    const filePath = path.join(this.config.get('UPLOAD_DIR', '/app/uploads'), filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  async getStorageStats() {
    const dir = this.config.get('UPLOAD_DIR', '/app/uploads');
    let totalSize = 0;
    let fileCount = 0;

    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      fileCount = files.length;
      files.forEach((file) => {
        try {
          totalSize += fs.statSync(path.join(dir, file)).size;
        } catch {}
      });
    }

    return { totalSize, fileCount, directory: dir };
  }
}
