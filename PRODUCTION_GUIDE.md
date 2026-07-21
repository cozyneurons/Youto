# 🚀 Youto — Production Deployment Guide

> **Last updated:** July 2026  
> This guide covers everything needed to deploy Youto to production from scratch — API keys, infrastructure, DNS, CI/CD, and post-deployment checks.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Keys & External Services](#2-api-keys--external-services)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Infrastructure Setup — Oracle Cloud VM](#4-infrastructure-setup--oracle-cloud-vm)
5. [Nginx Reverse Proxy & SSL](#5-nginx-reverse-proxy--ssl)
6. [Frontend Deployment — Netlify](#6-frontend-deployment--netlify)
7. [DNS & Domain Setup](#7-dns--domain-setup)
8. [CI/CD Pipeline (GitHub Actions)](#8-cicd-pipeline-github-actions)
9. [Database Migrations](#9-database-migrations)
10. [WebSockets in Production](#10-websockets-in-production)
11. [Production docker-compose Changes](#11-production-docker-compose-changes)
12. [Pre-Launch Checklist](#12-pre-launch-checklist)
13. [Monitoring & Maintenance](#13-monitoring--maintenance)
14. [Rollback Procedure](#14-rollback-procedure)

---

## 1. Architecture Overview

```
                         Internet
                             │
            ┌────────────────┴────────────────┐
            │                                 │
       yourdomain.com                 api.yourdomain.com
            │                                 │
         Netlify                       Oracle Cloud VM
     (React static build)              (Ubuntu 22.04)
                                             │
                                    ┌────────┴────────┐
                                    │     Nginx        │
                                    │  (Port 80/443)   │
                                    └────────┬─────────┘
                                             │
                              ┌──────────────┼──────────────┐
                              │              │              │
                          FastAPI       Celery Worker  Celery Beat
                         (Port 8000)    (2 workers)   (Scheduler)
                              │              │
                    ┌─────────┴──────────────┘
                    │              │
                PostgreSQL       Redis
                 (Internal)    (Internal)
```

**Why this split?**
- Netlify serves the React build as static files — free, fast, CDN-backed.
- Oracle Cloud Always-Free VM handles all dynamic workloads: API, DB, caching, task queue.
- PostgreSQL and Redis are **never exposed publicly** — internal Docker network only.

---

## 2. API Keys & External Services

### 2.1 Services Used

| Service | Purpose | Where to get it |
|---|---|---|
| **YouTube Data API v3** | Fetching playlist/video metadata | [Google Cloud Console](https://console.cloud.google.com/) |
| **Google Gemini API** | AI-generated lesson summaries | [Google AI Studio](https://aistudio.google.com/) |
| **Groq API** | Fast LLM inference (fallback to Gemini) | [console.groq.com](https://console.groq.com/) |
| **Google OAuth 2.0** | "Sign in with Google" authentication | [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials) |

### 2.2 How to Set Up Each Key

#### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the **YouTube Data API v3**
3. Go to **Credentials → Create Credentials → API Key**
4. Restrict the key to **YouTube Data API v3** only
5. Copy → `YOUTUBE_API_KEY`

> ⚠️ Free quota: 10,000 units/day. Each playlist fetch costs ~3 units.

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **Get API Key → Create API Key**
3. Copy → `GEMINI_API_KEY`

#### Groq API
1. Go to [console.groq.com](https://console.groq.com/)
2. Go to **API Keys → Create API Key**
3. Copy → `GROQ_API_KEY`

> Used as a fallback when Gemini is unavailable or rate-limited.

#### Google OAuth 2.0
1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. **Create Credentials → OAuth 2.0 Client IDs → Web application**
3. Add **Authorized JavaScript origins**:
   - `http://localhost:5173` (local dev)
   - `https://yourdomain.com` (production)
4. Copy the **Client ID** → used in both `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID`

> ⚠️ You MUST add your production domain to Google OAuth before going live or you'll get an `origin_mismatch` error.

---

## 3. Environment Variables Reference

### 3.1 Backend — `backend/.env`

```env
# ── Database ────────────────────────────────────────────────────────────────
# In Docker Compose, use the service name "postgres" as the host
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@postgres:5432/youto

# ── Redis / Celery ───────────────────────────────────────────────────────────
REDIS_URL=redis://redis:6379
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# ── Auth ─────────────────────────────────────────────────────────────────────
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=GENERATE_A_RANDOM_64_CHAR_HEX_STRING
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# ── Google OAuth ─────────────────────────────────────────────────────────────
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com

# ── CORS ─────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS=["https://yourdomain.com","https://www.yourdomain.com"]

# ── External APIs ────────────────────────────────────────────────────────────
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

> 🔐 NEVER commit `.env` to Git. The `.gitignore` already excludes it.

### 3.2 Frontend — Netlify Environment Variables

Set these in **Netlify → Site Settings → Environment Variables**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://api.yourdomain.com` |
| `VITE_GOOGLE_CLIENT_ID` | `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` |

---

## 4. Infrastructure Setup — Oracle Cloud VM

### 4.1 Initial VM Setup

```bash
# SSH into your Oracle VM
ssh ubuntu@YOUR_ORACLE_VM_IP

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose plugin
sudo apt-get install docker-compose-plugin -y

# Verify
docker --version
docker compose version
```

### 4.2 Oracle Cloud Firewall — TWO places to open ports

**Step 1 — OCI Security List (cloud firewall):**
1. OCI Console → Networking → VCNs → Your VCN → Security Lists
2. Add Ingress rules for TCP ports 80 and 443, Source: `0.0.0.0/0`

**Step 2 — VM-level iptables (OS firewall):**
```bash
sudo iptables -I INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT -p tcp --dport 443 -j ACCEPT
sudo apt-get install iptables-persistent -y
sudo netfilter-persistent save
```

### 4.3 Clone Repo & Configure Environment

```bash
cd ~
git clone https://github.com/cozyneurons/Youto.git youto
cd youto
cp backend/.env.example backend/.env
nano backend/.env   # fill in all values from Section 3.1
```

### 4.4 Start Production Containers

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4.5 Log Rotation

Docker logs can silently eat your entire disk on a small VM. Add logging limits to every service in your compose file (already included in the `docker-compose.prod.yml` below):

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"   # rotate after 10 MB per file
    max-file: "3"     # keep only the last 3 rotated files (~30 MB max per service)
```

You can also set this globally for the Docker daemon so every container is covered by default:

```bash
sudo nano /etc/docker/daemon.json
```
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```
```bash
sudo systemctl restart docker
```

---

## 5. Nginx Reverse Proxy & SSL

### 5.1 Install Nginx and Certbot

```bash
sudo apt-get install nginx certbot python3-certbot-nginx -y
```

### 5.2 Nginx Config for API

```bash
sudo nano /etc/nginx/sites-available/youto-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name api.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;

    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/youto-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5.3 Get SSL Certificate (Free)

```bash
# Point your DNS to the VM IP first, then:
sudo certbot --nginx -d api.yourdomain.com

# Certbot auto-renews. Verify:
sudo systemctl status certbot.timer
```

---

## 6. Frontend Deployment — Netlify

### 6.1 Connect Repo to Netlify

1. [app.netlify.com](https://app.netlify.com/) → **Add new site → Import from Git**
2. Select `cozyneurons/Youto`
3. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

### 6.2 Set Environment Variables

**Netlify → Site Settings → Environment Variables:**

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://api.yourdomain.com` |
| `VITE_GOOGLE_CLIENT_ID` | your Google OAuth Client ID |

### 6.3 SPA Routing Fix

Create `frontend/public/_redirects`:
```
/*    /index.html   200
```

This ensures Netlify serves `index.html` for all routes (React Router compatibility).

### 6.4 Custom Domain

**Netlify → Domain settings → Add custom domain → `yourdomain.com`**

---

## 7. DNS & Domain Setup

| Type | Name | Value | Purpose |
|---|---|---|---|
| `A` / `CNAME` | `@` | Netlify IP / Netlify DNS | Frontend |
| `CNAME` | `www` | `yourdomain.netlify.app` | www redirect |
| `A` | `api` | `YOUR_ORACLE_VM_IP` | Backend API |

> DNS propagation usually takes 5–30 minutes, up to 48 hours.

---

## 8. CI/CD Pipeline (GitHub Actions)

The existing workflow `.github/workflows/build-and-deploy.yml` runs on every push to `main`:

1. **Test** — pytest (backend) + tsc type-check (frontend)
2. **Build** — Docker images pushed to GitHub Container Registry (GHCR)
3. **Deploy** — SSH into Oracle VM, pull images, restart containers, run DB migrations

### 8.1 Required GitHub Secrets

**GitHub → Settings → Secrets → Actions:**

| Secret | Value |
|---|---|
| `ORACLE_HOST` | Oracle VM public IP |
| `ORACLE_USER` | SSH user (`ubuntu` or `opc`) |
| `ORACLE_SSH_KEY` | Contents of your CI SSH private key |

### 8.2 Generate CI SSH Key

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-ci" -f ~/.ssh/youto_ci

# Add public key to Oracle VM
ssh ubuntu@YOUR_ORACLE_IP "echo '$(cat ~/.ssh/youto_ci.pub)' >> ~/.ssh/authorized_keys"

# Paste the private key into ORACLE_SSH_KEY GitHub secret
cat ~/.ssh/youto_ci
```

---

## 9. Database Migrations

```bash
# Local dev — create migration after changing a model
cd backend
alembic revision --autogenerate -m "describe your change"
alembic upgrade head

# On Oracle VM (manual)
docker compose exec backend alembic upgrade head

# Check current state
docker compose exec backend alembic current

# Roll back one step
docker compose exec backend alembic downgrade -1
```

> ✅ The CI/CD pipeline automatically runs `alembic upgrade head` after every deployment.

---

## 10. WebSockets in Production

The app uses WebSockets for real-time features (live progress with friends).

- Nginx in Section 5.2 already has the correct `Upgrade` and `Connection` headers.
- Update any hardcoded WebSocket URLs in the frontend to use the env variable:

```ts
// ❌ Don't hardcode
const ws = new WebSocket("ws://localhost:8000/api/ws/...");

// ✅ Use env var
const wsUrl = import.meta.env.VITE_API_URL.replace('https', 'wss').replace('http', 'ws');
const ws = new WebSocket(`${wsUrl}/api/ws/...`);
```

---

## 11. Production docker-compose Changes

Key differences vs. development:

| Setting | Dev | Production |
|---|---|---|
| Frontend service | ✅ Included | ❌ Removed (Netlify handles it) |
| Backend command | `--reload` | `--workers 2` (no reload) |
| PostgreSQL port exposed | `5433:5432` | Not exposed |
| Redis port exposed | `6379:6379` | Not exposed |
| Images | Built locally | Pulled from GHCR |
| Log rotation | Not set | `max-size: 10m, max-file: 3` |

### Full `docker-compose.prod.yml`

Create this file at the repo root:

```yaml
# docker-compose.prod.yml — Backend services only (frontend is on Netlify)
services:

  # ── Database ───────────────────────────────────────────────────────────────
  postgres:
    image: postgres:16-alpine
    container_name: youto-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: youto
    # ✅ No external port — DB stays internal
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ── Cache ──────────────────────────────────────────────────────────────────
  redis:
    image: redis:7-alpine
    container_name: youto-redis
    # ✅ No external port — Redis stays internal
    volumes:
      - redis_data:/data
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ── Backend API ───────────────────────────────────────────────────────────
  backend:
    image: ghcr.io/cozyneurons/youto/backend:latest
    container_name: youto-backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/youto
      REDIS_URL: redis://redis:6379
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/0
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    # ✅ --workers 2 instead of --reload for production
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ── Celery Worker ─────────────────────────────────────────────────────────
  celery-worker:
    image: ghcr.io/cozyneurons/youto/backend:latest
    container_name: youto-celery
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/youto
      REDIS_URL: redis://redis:6379
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/0
    depends_on:
      - redis
      - postgres
    command: celery -A app.tasks.extract_video.celery_app worker --loglevel=info --concurrency=2
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # ── Celery Beat ───────────────────────────────────────────────────────────
  celery-beat:
    image: ghcr.io/cozyneurons/youto/backend:latest
    container_name: youto-celery-beat
    env_file:
      - ./backend/.env
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/youto
      REDIS_URL: redis://redis:6379
      CELERY_BROKER_URL: redis://redis:6379/0
      CELERY_RESULT_BACKEND: redis://redis:6379/0
    depends_on:
      - redis
      - postgres
    command: celery -A app.tasks.extract_video.celery_app beat --loglevel=info
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

volumes:
  postgres_data:
  redis_data:
```

Start with:
```bash
docker compose -f docker-compose.prod.yml up -d
```

---

## 12. Pre-Launch Checklist

### Security
- [ ] `SECRET_KEY` is a randomly generated 64-char hex string
- [ ] PostgreSQL and Redis ports **not** exposed publicly in production compose
- [ ] `.env` files confirmed NOT in Git (`git status`)
- [ ] `ALLOWED_ORIGINS` contains only the production frontend URL
- [ ] Production domain added to Google OAuth authorized origins in Google Cloud Console

### Infrastructure
- [ ] OCI Security List has ports 80 and 443 open
- [ ] VM-level iptables rules set for ports 80 and 443
- [ ] `sudo nginx -t` passes with no errors
- [ ] SSL cert issued successfully by Certbot
- [ ] DNS propagated: `dig api.yourdomain.com` returns VM IP

### Application
- [ ] `GET https://api.yourdomain.com/api/health` → `{"status":"ok"}`
- [ ] API docs load at `https://api.yourdomain.com/docs`
- [ ] Frontend loads at `https://yourdomain.com`
- [ ] "Sign in with Google" works on production domain
- [ ] Can create a course and mark a lesson as complete
- [ ] Celery processes tasks: `docker compose logs -f celery-worker`

### CI/CD
- [ ] GitHub Secrets `ORACLE_HOST`, `ORACLE_USER`, `ORACLE_SSH_KEY` are set
- [ ] Push to `main` triggers workflow and deploys successfully

---

## 13. Monitoring & Maintenance

```bash
# View live logs — all services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f celery-worker

# Check container health and status
docker compose ps
docker stats --no-stream

# Database backup
docker compose exec postgres pg_dump -U postgres youto > backup_$(date +%Y%m%d).sql

# Restore from backup
cat backup_YYYYMMDD.sql | docker compose exec -T postgres psql -U postgres -d youto

# Manual update (or let CI/CD handle it)
git pull origin main
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
docker compose exec backend alembic upgrade head

# Renew SSL manually (auto-renew is enabled via systemd timer)
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## 14. Rollback Procedure

```bash
# Option 1 — Roll back to previous Git commit
git log --oneline -5
git checkout <last-good-commit-hash>
docker compose -f docker-compose.prod.yml up --build -d

# Option 2 — Roll back last DB migration
docker compose exec backend alembic downgrade -1

# Option 3 — Restore from DB backup
cat backup_YYYYMMDD.sql | docker compose exec -T postgres psql -U postgres -d youto
```

---

## Quick Reference

| Resource | URL / Command |
|---|---|
| Frontend (prod) | `https://yourdomain.com` |
| Backend API (prod) | `https://api.yourdomain.com` |
| API Docs (Swagger) | `https://api.yourdomain.com/docs` |
| Health Check | `https://api.yourdomain.com/api/health` |
| Frontend (local) | `http://localhost:5173` |
| Backend (local) | `http://localhost:8000` |
| View all logs | `docker compose logs -f` |
| Restart everything | `docker compose -f docker-compose.prod.yml up -d` |
| Run DB migrations | `docker compose exec backend alembic upgrade head` |

---

*Stack: FastAPI · PostgreSQL · Redis · Celery · React · Vite · Docker · Nginx · Certbot*
