import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupController } from './setup.controller';
import { SetupService } from './setup.service';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { SystemConfig } from '../../entities/system-config.entity';
import { TwilioModule } from '../twilio/twilio.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Organization, SystemConfig]), TwilioModule],
  controllers: [SetupController],
  providers: [SetupService],
})
export class SetupModule {}
