# Deployment Guide

## VM Requirements

| Resource | Minimum | Recommended |
| -------- | ------- | ----------- |
| CPU      | 1 vCPU  | 2 vCPU      |
| RAM      | 1 GB    | 2 GB        |
| Disk     | 10 GB   | 20 GB       |
| OS       | Ubuntu 22.04+ / Debian 12+ | Ubuntu 24.04 |

**Required software on the VM:**
- Docker Engine 24+
- Docker Compose v2

## Initial Setup

### 1. Install Docker on the VM

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Set Up Cloudflare Tunnel

```bash
# Install cloudflared
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create pulse

# Configure tunnel (creates ~/.cloudflared/config.yml)
cat > ~/.cloudflared/config.yml << EOF
tunnel: <TUNNEL_ID>
credentials-file: /root/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: pulse.emmabyte.io
    service: http://localhost:3000
  - service: http_status:404
EOF

# Add DNS record
cloudflared tunnel route dns pulse pulse.emmabyte.io

# Install as service
sudo cloudflared service install
```

Alternatively, uncomment the `tunnel` service in `docker-compose.yml` and use a tunnel token:

```bash
# Get a tunnel token from Cloudflare Zero Trust dashboard
# Set it in your .env file:
CF_TUNNEL_TOKEN=eyJ...
```

### 3. Deploy

```bash
# Clone the repository
git clone <repo-url> /opt/pulse
cd /opt/pulse

# Create .env from example
cp .env.example .env
# Edit .env with production values (use a strong BETTER_AUTH_SECRET!)

# Start services
docker compose up -d

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Create initial admin user (use Prisma Studio or a seed script)
docker compose exec app npx prisma db seed
```

### 4. Verify

```bash
curl http://localhost:3000/api/health
# Should return: {"status":"ok","database":"connected"}

# Via Cloudflare Tunnel:
curl https://pulse.emmabyte.io/api/health
```

## CI/CD (GitHub Actions)

The deploy workflow (`.github/workflows/deploy.yml`) handles automated deployments on push to `main`.

### Required GitHub Secrets

| Secret           | Description                        |
| ---------------- | ---------------------------------- |
| `DEPLOY_HOST`    | VM IP address or hostname          |
| `DEPLOY_USER`    | SSH username on the VM             |
| `DEPLOY_SSH_KEY` | Private SSH key for deployment     |

### Deploy Flow

1. Build Docker image in CI
2. Save and transfer image to VM via SCP
3. Load image and restart containers via SSH
4. Run Prisma migrations

## Backups

PostgreSQL data is stored in the `pgdata` Docker volume. To back up:

```bash
# Dump database
docker compose exec db pg_dump -U pulse pulse > backup-$(date +%Y%m%d).sql

# Restore
docker compose exec -T db psql -U pulse pulse < backup-20240101.sql
```

## Monitoring

- Health endpoint: `GET /api/health`
- Docker logs: `docker compose logs -f app`
- Database: `docker compose exec db psql -U pulse`
