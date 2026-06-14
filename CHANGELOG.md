# Changelog

All notable changes to TwilioHub OSS are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2024-01-01

### Added
- Initial release of TwilioHub OSS
- Multi-tenant architecture: Super Admin → Dealers → Organizations → Users
- SMS messaging: send, receive, schedule, bulk, campaigns, templates
- Voice module: browser softphone (Twilio Device SDK), click-to-call, call history
- CRM contact management: CSV import/export, tags, custom fields
- Campaign engine: scheduled campaigns, rate limiting, AI message generation
- Dashboard analytics with Recharts (messages, calls, contacts)
- Setup wizard (5-step web-based installation)
- Twilio credential management with AES-256-GCM encryption
- Webhook engine for Twilio events + outgoing signed webhooks
- REST API with Swagger documentation at `/api-docs`
- API key management with argon2 hashing
- Two-factor authentication via TOTP (RFC 6238)
- JWT authentication with refresh token rotation
- Real-time updates via Socket.io (messages, calls, notifications)
- Automated daily backups (pg_dump + gzip)
- AI features via OpenRouter (reply suggestions, message generation)
- Docker Compose deployment (single command)
- NestJS 10 backend with BullMQ job queues
- Next.js 15 App Router frontend with Tailwind CSS v4
- Full TypeScript strict mode throughout
- MIT License
