import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1000000000000 implements MigrationInterface {
  name = 'InitialSchema1000000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable extensions
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);

    // System config
    await queryRunner.query(`
      CREATE TABLE "system_config" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "key" varchar NOT NULL UNIQUE,
        "value" text,
        "description" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_config" PRIMARY KEY ("id")
      )
    `);

    // Dealers
    await queryRunner.query(`
      CREATE TABLE "dealers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL UNIQUE,
        "owner_id" uuid,
        "is_active" boolean NOT NULL DEFAULT true,
        "plan" varchar NOT NULL DEFAULT 'standard',
        "email" varchar,
        "phone" varchar,
        "website" varchar,
        "branding" jsonb NOT NULL DEFAULT '{}',
        "settings" jsonb NOT NULL DEFAULT '{}',
        "max_organizations" int NOT NULL DEFAULT 10,
        "commission_percent" decimal(5,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_dealers" PRIMARY KEY ("id")
      )
    `);

    // Organizations
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "slug" varchar NOT NULL UNIQUE,
        "dealer_id" uuid,
        "owner_id" uuid,
        "plan" varchar NOT NULL DEFAULT 'starter',
        "is_active" boolean NOT NULL DEFAULT true,
        "timezone" varchar,
        "website" varchar,
        "industry" varchar,
        "address_line1" varchar,
        "city" varchar,
        "country" varchar,
        "settings" jsonb NOT NULL DEFAULT '{}',
        "branding" jsonb NOT NULL DEFAULT '{}',
        "max_users" int NOT NULL DEFAULT 5,
        "max_phone_numbers" int NOT NULL DEFAULT 3,
        "suspended_at" TIMESTAMP,
        "suspended_reason" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_organizations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_organizations_dealer" FOREIGN KEY ("dealer_id") REFERENCES "dealers"("id") ON DELETE SET NULL
      )
    `);

    // Users
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM('super_admin', 'dealer', 'org_owner', 'manager', 'agent');
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "username" varchar,
        "password" varchar NOT NULL,
        "first_name" varchar NOT NULL,
        "last_name" varchar NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'agent',
        "organization_id" uuid,
        "dealer_id" uuid,
        "two_factor_enabled" boolean NOT NULL DEFAULT false,
        "two_factor_secret" varchar,
        "email_verified" boolean NOT NULL DEFAULT false,
        "email_verification_token" varchar,
        "password_reset_token" varchar,
        "password_reset_expires" TIMESTAMP,
        "refresh_token" varchar,
        "last_login_at" TIMESTAMP,
        "last_login_ip" varchar,
        "is_active" boolean NOT NULL DEFAULT true,
        "preferences" jsonb NOT NULL DEFAULT '{}',
        "avatar_url" varchar,
        "phone" varchar,
        "timezone" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "FK_users_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_users_dealer" FOREIGN KEY ("dealer_id") REFERENCES "dealers"("id") ON DELETE SET NULL
      )
    `);

    // Twilio Credentials
    await queryRunner.query(`
      CREATE TABLE "twilio_credentials" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL UNIQUE,
        "account_sid_encrypted" varchar NOT NULL,
        "auth_token_encrypted" varchar NOT NULL,
        "api_key_encrypted" varchar,
        "api_secret_encrypted" varchar,
        "twiml_app_sid" varchar,
        "is_verified" boolean NOT NULL DEFAULT false,
        "last_checked_at" TIMESTAMP,
        "account_name" varchar,
        "account_status" varchar,
        "usage_this_month" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_twilio_credentials" PRIMARY KEY ("id"),
        CONSTRAINT "FK_twilio_credentials_org" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      )
    `);

    // Phone Numbers
    await queryRunner.query(`
      CREATE TYPE "phone_number_type_enum" AS ENUM('local', 'toll_free', 'mobile', 'voip');
      CREATE TABLE "phone_numbers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "phone_number" varchar NOT NULL,
        "friendly_name" varchar,
        "twilio_sid" varchar,
        "type" "phone_number_type_enum" NOT NULL DEFAULT 'local',
        "capabilities" jsonb NOT NULL DEFAULT '{"sms":false,"voice":false,"mms":false}',
        "sms_url" varchar,
        "voice_url" varchar,
        "is_active" boolean NOT NULL DEFAULT true,
        "label" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_phone_numbers" PRIMARY KEY ("id")
      )
    `);

    // Contacts
    await queryRunner.query(`
      CREATE TABLE "contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "first_name" varchar NOT NULL,
        "last_name" varchar,
        "email" varchar,
        "phone" varchar NOT NULL,
        "company" varchar,
        "title" varchar,
        "website" varchar,
        "notes" text,
        "tags" text NOT NULL DEFAULT '',
        "custom_fields" jsonb NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_opted_out" boolean NOT NULL DEFAULT false,
        "opted_out_at" TIMESTAMP,
        "last_contacted_at" TIMESTAMP,
        "message_count" int NOT NULL DEFAULT 0,
        "call_count" int NOT NULL DEFAULT 0,
        "country" varchar,
        "city" varchar,
        "timezone" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contacts" PRIMARY KEY ("id")
      )
    `);

    // Templates
    await queryRunner.query(`
      CREATE TABLE "templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "category" varchar,
        "content" text NOT NULL,
        "variables" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "usage_count" int NOT NULL DEFAULT 0,
        "created_by_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_templates" PRIMARY KEY ("id")
      )
    `);

    // Campaigns
    await queryRunner.query(`
      CREATE TYPE "campaign_status_enum" AS ENUM('draft','scheduled','running','paused','completed','failed','cancelled');
      CREATE TYPE "campaign_target_type_enum" AS ENUM('all','groups','individual');
      CREATE TABLE "campaigns" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "created_by_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "description" text,
        "status" "campaign_status_enum" NOT NULL DEFAULT 'draft',
        "template_id" uuid,
        "message" text NOT NULL,
        "from_number" varchar NOT NULL,
        "target_type" "campaign_target_type_enum" NOT NULL DEFAULT 'all',
        "target_groups" text,
        "target_contacts" text,
        "tag_filter" text,
        "scheduled_at" TIMESTAMP,
        "started_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "total_contacts" int NOT NULL DEFAULT 0,
        "sent_count" int NOT NULL DEFAULT 0,
        "delivered_count" int NOT NULL DEFAULT 0,
        "failed_count" int NOT NULL DEFAULT 0,
        "opt_out_count" int NOT NULL DEFAULT 0,
        "rate_per_second" int NOT NULL DEFAULT 1,
        "error_message" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_campaigns" PRIMARY KEY ("id")
      )
    `);

    // Messages
    await queryRunner.query(`
      CREATE TYPE "message_direction_enum" AS ENUM('inbound','outbound');
      CREATE TYPE "message_status_enum" AS ENUM('queued','sending','sent','delivered','failed','received','undelivered','scheduled');
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "contact_id" uuid,
        "from_number" varchar NOT NULL,
        "to_number" varchar NOT NULL,
        "body" text NOT NULL,
        "direction" "message_direction_enum" NOT NULL,
        "status" "message_status_enum" NOT NULL DEFAULT 'queued',
        "twilio_sid" varchar,
        "campaign_id" uuid,
        "template_id" uuid,
        "scheduled_at" TIMESTAMP,
        "sent_at" TIMESTAMP,
        "delivered_at" TIMESTAMP,
        "error_code" varchar,
        "error_message" varchar,
        "num_segments" int NOT NULL DEFAULT 1,
        "num_media" int NOT NULL DEFAULT 0,
        "media_urls" text,
        "price" varchar,
        "price_unit" varchar,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    // Calls
    await queryRunner.query(`
      CREATE TYPE "call_direction_enum" AS ENUM('inbound','outbound');
      CREATE TYPE "call_status_enum" AS ENUM('queued','ringing','in-progress','completed','failed','busy','no-answer','canceled');
      CREATE TABLE "calls" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "contact_id" uuid,
        "user_id" uuid,
        "from_number" varchar NOT NULL,
        "to_number" varchar NOT NULL,
        "direction" "call_direction_enum" NOT NULL,
        "status" "call_status_enum" NOT NULL DEFAULT 'queued',
        "twilio_sid" varchar,
        "duration" int,
        "price" varchar,
        "price_unit" varchar,
        "started_at" TIMESTAMP,
        "ended_at" TIMESTAMP,
        "recording_url" varchar,
        "recording_sid" varchar,
        "recording_duration" int,
        "notes" text,
        "tags" text,
        "answered_by" varchar,
        "caller_name" varchar,
        "hangup_by" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_calls" PRIMARY KEY ("id")
      )
    `);

    // Notifications
    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM('new_message','missed_call','campaign_completed','user_invitation','system_alert','twilio_error','webhook_failure');
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "organization_id" uuid,
        "type" "notification_type_enum" NOT NULL,
        "title" varchar NOT NULL,
        "message" text NOT NULL,
        "data" jsonb,
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Audit Logs
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "user_email" varchar,
        "organization_id" uuid,
        "action" varchar NOT NULL,
        "resource" varchar NOT NULL,
        "resource_id" varchar,
        "details" jsonb,
        "ip" varchar,
        "user_agent" varchar,
        "result" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    // API Keys
    await queryRunner.query(`
      CREATE TABLE "api_keys" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "key_hash" varchar NOT NULL,
        "key_prefix" varchar NOT NULL,
        "scopes" text NOT NULL,
        "last_used_at" TIMESTAMP,
        "expires_at" TIMESTAMP,
        "is_active" boolean NOT NULL DEFAULT true,
        "request_count" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_api_keys" PRIMARY KEY ("id")
      )
    `);

    // Webhooks
    await queryRunner.query(`
      CREATE TABLE "webhooks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "organization_id" uuid NOT NULL,
        "name" varchar NOT NULL,
        "url" varchar NOT NULL,
        "events" text NOT NULL,
        "signing_secret" varchar NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "last_called_at" TIMESTAMP,
        "failure_count" int NOT NULL DEFAULT 0,
        "success_count" int NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhooks" PRIMARY KEY ("id")
      )
    `);

    // Webhook Events
    await queryRunner.query(`
      CREATE TYPE "webhook_event_status_enum" AS ENUM('pending','success','failed');
      CREATE TABLE "webhook_events" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "webhook_id" uuid NOT NULL,
        "organization_id" uuid NOT NULL,
        "event" varchar NOT NULL,
        "payload" jsonb NOT NULL,
        "response" jsonb,
        "status_code" int,
        "attempts" int NOT NULL DEFAULT 0,
        "next_retry_at" TIMESTAMP,
        "completed_at" TIMESTAMP,
        "status" "webhook_event_status_enum" NOT NULL DEFAULT 'pending',
        "error_message" varchar,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_events" PRIMARY KEY ("id"),
        CONSTRAINT "FK_webhook_events_webhook" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE
      )
    `);

    // Indexes
    await queryRunner.query(`CREATE INDEX "IDX_users_org" ON "users"("organization_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_dealer" ON "users"("dealer_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_contacts_org" ON "contacts"("organization_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_contacts_phone" ON "contacts"("phone")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_org_date" ON "messages"("organization_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_contact" ON "messages"("contact_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_twilio_sid" ON "messages"("twilio_sid")`);
    await queryRunner.query(`CREATE INDEX "IDX_calls_org_date" ON "calls"("organization_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_calls_twilio_sid" ON "calls"("twilio_sid")`);
    await queryRunner.query(`CREATE INDEX "IDX_campaigns_org" ON "campaigns"("organization_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user" ON "notifications"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_org_date" ON "audit_logs"("organization_id", "created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_webhook_events_webhook" ON "webhook_events"("webhook_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'webhook_events', 'webhooks', 'api_keys', 'audit_logs', 'notifications',
      'calls', 'messages', 'campaigns', 'templates', 'contacts',
      'phone_numbers', 'twilio_credentials', 'users', 'organizations', 'dealers', 'system_config',
    ];
    for (const t of tables) await queryRunner.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);

    const types = [
      'user_role_enum', 'campaign_status_enum', 'campaign_target_type_enum',
      'message_direction_enum', 'message_status_enum', 'call_direction_enum',
      'call_status_enum', 'notification_type_enum', 'webhook_event_status_enum', 'phone_number_type_enum',
    ];
    for (const t of types) await queryRunner.query(`DROP TYPE IF EXISTS "${t}"`);
  }
}
