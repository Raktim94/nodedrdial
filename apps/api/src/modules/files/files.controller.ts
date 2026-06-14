import { Controller, Post, Get, Delete, Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      url: this.filesService.getFileUrl(file.filename),
    };
  }

  @Get('stats')
  getStats() {
    return this.filesService.getStorageStats();
  }

  @Delete(':filename')
  async delete(@Param('filename') filename: string) {
    await this.filesService.deleteFile(filename);
    return { message: 'File deleted' };
  }
}
