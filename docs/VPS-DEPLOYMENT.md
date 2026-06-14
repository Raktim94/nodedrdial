# VPS Deployment Guide

## Minimum Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 / Debian 12 | Debian 13 |

## 1. Install Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker
```

## 2. Clone and Configure

```bash
git clone https://github.com/your-org/twilioHub-oss.git /opt/twilioHub
cd /opt/twilioHub

cp .env.example .env
```

Edit `.env`:
```env
# App
APP_URL=https://hub.yourdomain.com
NODE_ENV=production

# Database
POSTGRES_PASSWORD=<strong-random-password>

# Redis
REDIS_PASSWORD=<strong-random-password>

# Secrets (generate with: openssl rand -base64 64)
JWT_SECRET=<64-char-secret>
JWT_REFRESH_SECRET=<different-64-char-secret>

# Encryption (generate with: openssl rand -hex 32)
ENCRYPTION_KEY=<32-byte-hex>

# Optional: AI features
OPENROUTER_API_KEY=<your-openrouter-key>
```

## 3. SSL with Let's Encrypt

Install Certbot:
```bash
apt install certbot python3-certbot-nginx -y
certbot certonly --standalone -d hub.yourdomain.com
```

Update nginx config to use SSL. Edit `docker/nginx/conf.d/default.conf`:

```nginx
server {
    listen 80;
    server_name hub.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name hub.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/hub.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/hub.yourdomain.com/privkey.pem;

    # ... rest of config
}
```

Mount certificates in `docker-compose.yml`:
```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
    - ./docker/nginx/conf.d:/etc/nginx/conf.d:ro
```

## 4. Launch

```bash
docker compose up -d
docker compose logs -f
```

## 5. Open Setup Wizard

Navigate to `https://hub.yourdomain.com` — the wizard will run automatically on first visit.

## 6. Auto-renewal for SSL

```bash
crontab -e
# Add:
0 3 * * * certbot renew --quiet && docker compose -f /opt/twilioHub/docker-compose.yml restart nginx
```

## 7. Firewall

```bash
ufw allow 22    # SSH
ufw allow 80    # HTTP (redirect to HTTPS)
ufw allow 443   # HTTPS
ufw enable
```

## Backups

Automated daily backups run at 2 AM via the `backup` service. Files are stored in `./backups/`.

To manually trigger a backup:
```bash
docker compose exec backup /scripts/backup.sh
```

To restore:
```bash
docker compose exec -T postgres pg_restore -U twilioHub -d twilioHub_production < ./backups/backup_YYYY-MM-DD.sql.gz
```

## Updating

```bash
cd /opt/twilioHub
git pull
docker compose pull
docker compose up -d --build
```

Migrations run automatically on startup.
