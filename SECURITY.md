# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest  | ✅ |
| < 1.0   | ❌ |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Email: security@twilioHub.dev

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You will receive a response within 48 hours. We follow a 90-day disclosure timeline.

## Security Features

- **Passwords**: argon2id hashing (memory=65536, iterations=3, parallelism=4)
- **Twilio credentials**: AES-256-GCM encryption with per-record scrypt-derived keys
- **JWT**: RS256/HS256 with short-lived access tokens (15 min) + refresh rotation
- **API keys**: argon2id hashed, never stored in plain text
- **Rate limiting**: Configurable per endpoint via ThrottlerModule
- **2FA**: TOTP via RFC 6238 (30s window, SHA1, 6 digits)
- **Audit logs**: All admin and destructive actions logged
- **Multi-tenancy**: Row-level isolation via organizationId on all entities

## Deployment Hardening

- Run behind Nginx with security headers
- Use strong, unique values for all secrets in `.env`
- Enable firewall (only ports 80/443 public)
- Keep Docker images updated
- Run daily backups (built-in backup service)
