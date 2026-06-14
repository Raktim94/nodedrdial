<div align="center">

# TwilioHub OSS

**Production-ready, self-hosted, open-source Twilio communications platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](apps/api)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](apps/web)

Built and maintained by **[Nodedr Infotech Pvt Ltd](https://www.nodedr.com)**

[Features](#features) · [Quick Start](#quick-start) · [Installation](#installation) · [Documentation](#documentation) · [Contributing](#contributing)

</div>

---

## What is TwilioHub OSS?

TwilioHub OSS is a complete, self-hosted communications platform that connects to your Twilio account. Send & receive SMS, handle voice calls in the browser, manage contacts, run campaigns — all from a single, beautiful web interface.

**No monthly SaaS fees. No vendor lock-in. Your data, your server.**

### Who is it for?

- **Businesses** that want to own their communication infrastructure
- **Developers** who need a white-label Twilio dashboard to resell
- **Agencies** managing SMS and voice for multiple clients (multi-tenant)
- **Enterprises** with strict data residency requirements

---

## Features

### 💬 Messaging
- Two-way SMS via Twilio phone numbers
- Real-time conversation inbox (WebSocket-powered)
- Message templates with variables (`{firstName}`, `{company}`, etc.)
- Schedule messages for future delivery
- Bulk SMS to thousands of contacts
- Delivery status tracking (Delivered, Failed, Undelivered)
- AI-powered reply suggestions (via OpenRouter free tier)

### 📞 Voice Calls
- **Browser softphone** — make and receive calls without any desktop app
- Click-to-call from any contact card
- Inbound call notifications in real time
- Call recordings (stored via Twilio)
- Full call history with duration, direction, timestamps
- Call notes and tagging

### 👥 CRM / Contacts
- Rich contact profiles (name, phone, email, company)
- CSV bulk import / export
- Tag-based segmentation
- Custom fields (JSONB)
- Opt-out management (automatic stop handling)
- Full activity history per contact

### 📢 Campaigns
- SMS campaigns with personalized variables
- Scheduled campaigns (run at a future date/time)
- Target: all contacts, by tag, or hand-pick individuals
- Configurable send rate (messages/second)
- Pause and resume in-flight campaigns
- AI message generation (describe your product → AI writes the SMS)
- Real-time delivery analytics (sent / delivered / failed / opt-outs)

### 🏢 Multi-Tenancy
- **5-level hierarchy:** Super Admin → Dealers → Organizations → Managers → Agents
- Complete data isolation — organizations never see each other's data
- Dealer portal: resellers can create and manage their own customer orgs
- Role-based access control enforced at API and UI level

### 🔒 Security
- Argon2id password hashing (not bcrypt)
- AES-256-GCM encryption for all Twilio credentials at rest
- JWT access tokens (15 min) + refresh tokens (30 day, rotated on use)
- Optional 2FA via TOTP (Google Authenticator, Authy, etc.)
- Full audit log of admin actions
- Rate limiting on all API endpoints

### 🛠️ Developer Tools
- Full REST API with interactive Swagger docs at `/api-docs`
- API key management for programmatic access
- Outgoing webhooks with HMAC-SHA256 signature verification
- Real-time events via Socket.io
- TypeScript throughout (strict mode)

### ⚙️ Operations
- One-command Docker deployment
- Automated daily backups (PostgreSQL → gzip, retained 7 days)
- System health monitoring (memory, uptime, queue stats)
- Web-based 5-step setup wizard (no CLI needed after deploy)

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 15 (App Router), React 19 | Modern, performant, SEO-friendly |
| Styling | Tailwind CSS v4 (CSS-first) | No config file, lightning fast |
| State | Zustand + TanStack Query | Simple global state + async data |
| Backend | NestJS 10, TypeScript | Structured, testable, Swagger built-in |
| ORM | TypeORM 0.3 | Migrations, relations, PostgreSQL features |
| Database | PostgreSQL 16 | JSONB, full-text search, UUID keys |
| Queue | Redis 7 + BullMQ | Scheduled SMS, campaign execution |
| Real-time | Socket.io | Message/call notifications |
| Voice | @twilio/voice-sdk | Browser softphone (WebRTC) |
| SMS/Voice | Twilio REST API | Sending SMS, outbound calls |
| AI | OpenRouter (free tier) | Reply suggestions, content generation |
| Proxy | Nginx | SSL termination, WebSocket upgrade |
| Container | Docker + Compose | Reproducible, single-command deploy |

---

## Installation

> Choose your operating system:
> - [Windows](#windows)
> - [macOS](#macos)
> - [Linux (Ubuntu / Debian)](#linux)

---

## Windows

### Step 1 — Install Docker Desktop

1. Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Click **"Download for Windows"**
3. Run the installer (`Docker Desktop Installer.exe`)
4. When prompted, ensure **"Use WSL 2 instead of Hyper-V"** is checked
5. Restart your computer when the installer finishes
6. Launch **Docker Desktop** from the Start menu and wait for the whale icon to turn green in the system tray

**Verify Docker is working** — open Command Prompt (`Win + R` → type `cmd` → Enter):
```cmd
docker --version
docker compose version
```
Both should print version numbers (e.g. `Docker version 26.x`, `Docker Compose version v2.x`).

### Step 2 — Install Git

1. Go to [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Download and run the installer
3. Accept all defaults and click **Next** through the wizard

**Verify:**
```cmd
git --version
```

### Step 3 — Download TwilioHub OSS

Open **Command Prompt** or **PowerShell** and run:

```cmd
git clone https://github.com/nodedr/twilioHub-oss.git
cd twilioHub-oss
```

### Step 4 — Configure Environment

```cmd
copy .env.example .env
notepad .env
```

Notepad will open. Edit these required values:

```env
# Your server's public address (use localhost for local testing)
APP_URL=http://localhost

# Database password — change to something strong
POSTGRES_PASSWORD=change_me_to_something_strong

# Redis password — change to something strong
REDIS_PASSWORD=change_me_too

# JWT secrets — generate random strings (see tip below)
JWT_SECRET=paste_a_long_random_string_here_at_least_64_chars
JWT_REFRESH_SECRET=paste_a_different_long_random_string_here

# Encryption key for Twilio credentials (64 hex characters)
ENCRYPTION_KEY=paste_a_64_char_hex_string_here
```

**Tip — Generate secrets easily:**
Open PowerShell and run:
```powershell
# Generate JWT_SECRET
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))

# Generate ENCRYPTION_KEY (32 random bytes = 64 hex chars)
(1..32 | ForEach-Object { '{0:x2}' -f (Get-Random -Maximum 256) }) -join ''
```

Save the file (`Ctrl+S`) and close Notepad.

### Step 5 — Start TwilioHub

```cmd
docker compose up -d
```

Docker will download all required images (about 1–2 GB on first run — this takes a few minutes). When it finishes:

```
✔ Container twilioHub-postgres   Started
✔ Container twilioHub-redis      Started
✔ Container twilioHub-api        Started
✔ Container twilioHub-web        Started
✔ Container twilioHub-nginx      Started
```

### Step 6 — Run the Setup Wizard

Open your browser and go to:
```
http://localhost
```

The **Setup Wizard** will appear automatically. Follow the 4 steps:

1. **Admin Account** — enter your name, email, and a strong password
2. **Organization** — enter your company name
3. **Twilio** *(optional)* — enter your Twilio Account SID and Auth Token
4. **Review** — confirm and click **Complete Setup**

You'll be redirected to the login page. Sign in with the credentials you just created.

### Troubleshooting (Windows)

| Problem | Solution |
|---------|----------|
| "Docker daemon is not running" | Open Docker Desktop from Start menu and wait for it to fully start |
| "Port 80 already in use" | Change `NGINX_PORT=80` to `NGINX_PORT=8080` in `.env`, then access at `http://localhost:8080` |
| Setup wizard doesn't appear | Run `docker compose logs api` to check for errors |
| Can't connect after setup | Run `docker compose ps` — all services should show "running" |

---

## macOS

### Step 1 — Install Docker Desktop

1. Go to [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Click **"Download for Mac"** — choose **Apple Silicon** if you have an M1/M2/M3/M4 Mac, or **Intel** otherwise
3. Open the `.dmg` file and drag Docker to Applications
4. Launch Docker from Applications — click **Open** on the security prompt
5. Wait for the Docker icon in the menu bar to stop animating (it's ready when it's still)

**Verify** — open Terminal (`Cmd + Space` → type "Terminal"):
```bash
docker --version
docker compose version
```

### Step 2 — Install Git

macOS usually has Git pre-installed. Check:
```bash
git --version
```

If not installed, macOS will prompt you to install Xcode Command Line Tools — click **Install** and wait.

### Step 3 — Download TwilioHub OSS

In Terminal:
```bash
git clone https://github.com/nodedr/twilioHub-oss.git
cd twilioHub-oss
```

### Step 4 — Configure Environment

```bash
cp .env.example .env
open -e .env
```

This opens `.env` in TextEdit. Set these required values:

```env
APP_URL=http://localhost
POSTGRES_PASSWORD=choose_a_strong_password
REDIS_PASSWORD=choose_another_strong_password
JWT_SECRET=paste_random_string_here
JWT_REFRESH_SECRET=paste_different_random_string_here
ENCRYPTION_KEY=paste_64_hex_chars_here
```

**Generate secrets in Terminal:**
```bash
# JWT_SECRET and JWT_REFRESH_SECRET
openssl rand -base64 64

# ENCRYPTION_KEY
openssl rand -hex 32
```

Run each command, copy the output, paste into `.env`. Save and close the file.

### Step 5 — Start TwilioHub

```bash
docker compose up -d
```

Wait for all containers to start (2–3 minutes on first run while images download).

Check everything is running:
```bash
docker compose ps
```

All services should show `running` or `healthy`.

### Step 6 — Run the Setup Wizard

Open Safari or Chrome and go to:
```
http://localhost
```

The Setup Wizard appears on first visit. Complete all steps and sign in.

### Running on a Custom Port (if port 80 is busy)

If you already have a web server on port 80 (e.g., MAMP), edit `.env`:
```env
NGINX_PORT=8080
```
Then access at `http://localhost:8080`.

### Troubleshooting (macOS)

| Problem | Solution |
|---------|----------|
| Permission denied on port 80 | Use `NGINX_PORT=8080` in `.env` |
| Docker out of disk space | In Docker Desktop → Settings → Resources → increase disk size |
| "Error response from daemon: Ports are not available" | Another app is using port 80. Change `NGINX_PORT`. |
| Slow on Apple Silicon | Docker Desktop 4.25+ has native ARM support — update Docker Desktop |

---

## Linux

*Tested on Ubuntu 22.04 LTS, Ubuntu 24.04 LTS, Debian 12, and Debian 13.*

### Step 1 — Install Docker Engine

```bash
# Remove old Docker versions if any
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Install Docker Engine (official script)
curl -fsSL https://get.docker.com | sudo sh

# Add your user to the docker group (so you don't need sudo)
sudo usermod -aG docker $USER

# Apply group change without logging out
newgrp docker

# Enable Docker to start on boot
sudo systemctl enable --now docker
```

**Verify:**
```bash
docker --version
docker compose version
```

### Step 2 — Install Git

```bash
sudo apt update && sudo apt install -y git
git --version
```

### Step 3 — Download TwilioHub OSS

```bash
# Clone to /opt/twilioHub (recommended for servers)
sudo git clone https://github.com/nodedr/twilioHub-oss.git /opt/twilioHub
sudo chown -R $USER:$USER /opt/twilioHub
cd /opt/twilioHub
```

Or clone to your home directory for local use:
```bash
git clone https://github.com/nodedr/twilioHub-oss.git ~/twilioHub
cd ~/twilioHub
```

### Step 4 — Configure Environment

```bash
cp .env.example .env
nano .env
```

Set these values (minimum required):

```env
# Public URL — use your domain or server IP
APP_URL=http://your-server-ip
# For local use:
# APP_URL=http://localhost

POSTGRES_PASSWORD=use_a_strong_unique_password
REDIS_PASSWORD=use_another_strong_password

JWT_SECRET=        # see below
JWT_REFRESH_SECRET=# see below
ENCRYPTION_KEY=    # see below
```

**Generate secrets:**
```bash
# Run each line and paste the output into .env
echo "JWT_SECRET=$(openssl rand -base64 64)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 64)"
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)"
```

Save the file: `Ctrl+O` → Enter → `Ctrl+X`.

### Step 5 — Start TwilioHub

```bash
docker compose up -d
```

Watch the logs during first startup:
```bash
docker compose logs -f
```

Press `Ctrl+C` to stop watching logs. The platform is ready when you see:
```
api    | [NestApplication] Nest application successfully started
web    | ▲ Next.js 15.x.x
```

### Step 6 — Run the Setup Wizard

If running locally:
```
http://localhost
```

If on a VPS, use your server's IP address:
```
http://YOUR_SERVER_IP
```

Complete the 4-step wizard to create your admin account.

### Step 7 (Production) — Set Up SSL with Let's Encrypt

For a real domain with HTTPS:

```bash
# Install Certbot
sudo apt install -y certbot

# Stop nginx temporarily to get certificate
docker compose stop nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Start nginx again
docker compose start nginx
```

Then update `docker/nginx/conf.d/default.conf` to add SSL. See [docs/VPS-DEPLOYMENT.md](docs/VPS-DEPLOYMENT.md) for the full SSL configuration.

### Auto-start on Server Reboot

```bash
# Create a systemd service
sudo tee /etc/systemd/system/twilioHub.service > /dev/null <<EOF
[Unit]
Description=TwilioHub OSS
Requires=docker.service
After=docker.service

[Service]
WorkingDirectory=/opt/twilioHub
ExecStart=/usr/bin/docker compose up
ExecStop=/usr/bin/docker compose down
Restart=always
User=$USER

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable twilioHub
```

### Troubleshooting (Linux)

| Problem | Solution |
|---------|----------|
| "Permission denied" on docker socket | Run `newgrp docker` or log out and back in |
| Port 80 already in use (Apache/Nginx) | Stop the conflicting service: `sudo systemctl stop apache2` |
| Database connection refused | Wait 30s for postgres to initialize on first start |
| Out of disk space | `docker system prune -f` to clean unused images |
| Firewall blocking access | `sudo ufw allow 80` and `sudo ufw allow 443` |

---

## Post-Installation: Connect Twilio

After completing the setup wizard:

1. Go to **Settings → Twilio Credentials**
2. Enter your **Account SID** and **Auth Token** (from [console.twilio.com](https://console.twilio.com))
3. Click **Test Connection** — you should see a green "Connected" banner
4. Click **Sync Phone Numbers** to import your Twilio numbers

For browser calling (softphone), you also need:
- A **Twilio API Key** (created in Twilio Console → API Keys)
- A **TwiML App** pointing to `https://your-domain.com/api/webhooks/twilio/voice`

See [docs/TWILIO-INTEGRATION.md](docs/TWILIO-INTEGRATION.md) for full details.

---

## Connect AI Features

TwilioHub uses OpenRouter for AI features (reply suggestions, campaign message generation).

The free tier is sufficient for most use cases:

1. Sign up at [openrouter.ai](https://openrouter.ai)
2. Copy your API key
3. Add it to `.env`:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-...
   OPENROUTER_DEFAULT_MODEL=google/gemini-2.0-flash-exp:free
   ```
4. Restart: `docker compose restart api`

---

## Updating

```bash
cd /opt/twilioHub       # or wherever you cloned it
git pull
docker compose pull
docker compose up -d --build
```

Database migrations run automatically on startup.

---

## Management Commands

```bash
# View running containers
docker compose ps

# View real-time logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f api
docker compose logs -f web

# Stop all services
docker compose down

# Restart a service
docker compose restart api

# Create a manual database backup
docker compose exec backup /scripts/backup.sh

# Open a database shell
docker compose exec postgres psql -U twilioHub -d twilioHub_production

# Open a Redis shell
docker compose exec redis redis-cli -a YOUR_REDIS_PASSWORD
```

---

## Architecture

```
                        Internet
                           │
                     ┌─────▼──────┐
                     │   Nginx    │  :80 / :443
                     │  (Proxy)   │
                     └──┬──────┬──┘
                        │      │
              ┌─────────▼─┐  ┌─▼───────────┐
              │  Next.js  │  │   NestJS    │
              │   :3000   │  │    :3001    │
              │ (Frontend)│  │   (API)     │
              └───────────┘  └──┬───────┬──┘
                                │       │
                    ┌───────────▼─┐ ┌───▼──────┐
                    │ PostgreSQL  │ │  Redis   │
                    │    :5432    │ │   :6379  │
                    └─────────────┘ └──────────┘

Role Hierarchy:
  Super Admin  ──→  full system access
       │
  Dealer       ──→  manage their own organizations
       │
  Org Owner    ──→  manage their organization
       │
  Manager      ──→  manage agents, view all data
       │
  Agent        ──→  send/receive messages, make calls
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [VPS Deployment Guide](docs/VPS-DEPLOYMENT.md) | SSL setup, systemd, firewall, backups |
| [Twilio Integration](docs/TWILIO-INTEGRATION.md) | API keys, TwiML apps, webhooks |
| [API Reference](http://your-server/api-docs) | Interactive Swagger documentation |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [SECURITY.md](SECURITY.md) | Reporting vulnerabilities |

---

## Screenshots

| Dashboard | Messages | Campaigns |
|-----------|----------|-----------|
| Analytics overview with charts | Conversation inbox with AI replies | Campaign builder with real-time stats |

*Screenshots coming soon*

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to get started.

Areas where we'd love help:
- 🌐 Translations / i18n
- 🧪 Test coverage (Jest for API, Playwright for E2E)
- 📱 Mobile-optimized views
- 📊 Advanced analytics charts
- 🔌 More webhook integrations

---

## License

MIT License — see [LICENSE](LICENSE)

You are free to use, modify, and distribute this software for any purpose, including commercial use.

---

## About

TwilioHub OSS is built and maintained by **[Nodedr Infotech Pvt Ltd](https://www.nodedr.com)** — a web development studio specializing in premium marketing sites and SaaS products.

**Website:** [www.nodedr.com](https://www.nodedr.com)

If TwilioHub OSS saves you time or money, consider:
- Starring the repo ⭐
- Sharing it with others
- [Hiring Nodedr](https://www.nodedr.com) for custom development

---

<div align="center">
Made with ❤️ by <a href="https://www.nodedr.com">Nodedr Infotech Pvt Ltd</a>
</div>
