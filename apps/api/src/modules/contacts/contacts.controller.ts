import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Res, HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ContactsService } from './contacts.service';
import { CreateContactDto, UpdateContactDto, ListContactsDto, BulkDeleteDto } from './dto/contacts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('contacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a contact' })
  create(@CurrentUser('organizationId') orgId: string, @Body() dto: CreateContactDto) {
    return this.contactsService.create(orgId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List contacts' })
  findAll(@CurrentUser('organizationId') orgId: string, @Query() query: ListContactsDto) {
    return this.contactsService.findAll(orgId, query);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all unique tags' })
  getTags(@CurrentUser('organizationId') orgId: string) {
    return this.contactsService.getAllTags(orgId);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export contacts as CSV' })
  async export(@CurrentUser('organizationId') orgId: string, @Res() res: Response) {
    const csv = await this.contactsService.exportCsv(orgId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="contacts.csv"');
    res.status(HttpStatus.OK).send(csv);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import contacts from CSV' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  import(@CurrentUser('organizationId') orgId: string, @UploadedFile() file: Express.Multer.File) {
    return this.contactsService.importCsv(orgId, file.buffer);
  }

  @Delete('bulk')
  @ApiOperation({ summary: 'Bulk delete contacts' })
  bulkDelete(@CurrentUser('organizationId') orgId: string, @Body() dto: BulkDeleteDto) {
    return this.contactsService.bulkDelete(orgId, dto.ids);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact by ID' })
  findOne(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.contactsService.findOne(orgId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update contact' })
  update(@CurrentUser('organizationId') orgId: string, @Param('id') id: string, @Body() dto: UpdateContactDto) {
    return this.contactsService.update(orgId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  remove(@CurrentUser('organizationId') orgId: string, @Param('id') id: string) {
    return this.contactsService.remove(orgId, id);
  }
}
