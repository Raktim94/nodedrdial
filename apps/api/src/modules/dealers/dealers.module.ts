import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealersController } from './dealers.controller';
import { DealersService } from './dealers.service';
import { Dealer } from '../../entities/dealer.entity';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dealer, Organization, User])],
  controllers: [DealersController],
  providers: [DealersService],
  exports: [DealersService],
})
export class DealersModule {}
