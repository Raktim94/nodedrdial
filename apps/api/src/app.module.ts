import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { DealersModule } from './modules/dealers/dealers.module';
import { TwilioModule } from './modules/twilio/twilio.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CallsModule } from './modules/calls/calls.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { FilesModule } from './modules/files/files.module';
import { BackupModule } from './modules/backup/backup.module';
import { AdminModule } from './modules/admin/admin.module';
import { SetupModule } from './modules/setup/setup.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EventsGateway } from './gateways/events.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST', 'localhost'),
        port: config.get<number>('POSTGRES_PORT', 5432),
        database: config.get('POSTGRES_DB', 'twiliohub'),
        username: config.get('POSTGRES_USER', 'twiliohub'),
        password: config.get('POSTGRES_PASSWORD'),
        entities: [__dirname + '/entities/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: false,
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('POSTGRES_SSL') === 'true' ? { rejectUnauthorized: false } : false,
        extra: { max: 20 },
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 500,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        },
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
            limit: config.get<number>('RATE_LIMIT_MAX', 100),
          },
        ],
      }),
    }),

    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    DealersModule,
    TwilioModule,
    MessagesModule,
    CallsModule,
    ContactsModule,
    CampaignsModule,
    WebhooksModule,
    NotificationsModule,
    ApiKeysModule,
    FilesModule,
    BackupModule,
    AdminModule,
    SetupModule,
    AiModule,
    AnalyticsModule,
  ],
  providers: [EventsGateway],
})
export class AppModule {}
