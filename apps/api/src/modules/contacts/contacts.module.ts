import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { Contact } from '../../entities/contact.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contact]),
    MulterModule.register({ storage: require('multer').memoryStorage() }),
  ],
  controllers: [ContactsController],
  providers: [ContactsService],
  exports: [ContactsService],
})
export class ContactsModule {}
