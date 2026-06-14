import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { Dealer } from '../../entities/dealer.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { Message } from '../../entities/message.entity';
import { Call } from '../../entities/call.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, Dealer, AuditLog, Message, Call])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
