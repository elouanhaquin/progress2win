# Docker Deployment Guide for Tracky (Progress2Win)

## Prerequisites

- Docker installed ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (included with Docker Desktop)

## Quick Start

### 1. Clone and Setup

```bash
cd Tracky
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and change the JWT secrets:

```env
JWT_SECRET=your-very-long-and-secure-secret-key-here
JWT_REFRESH_SECRET=your-very-long-and-secure-refresh-secret-key-here
```

**⚠️ IMPORTANT:** Use strong, random secrets in production!

### 3. Build and Run

```bash
docker-compose up --build -d
```

This will:
- Build the backend container
- Build the frontend container with nginx
- Start both services
- Create a network between them

### 4. Access the Application

- **Frontend:** http://localhost
- **Backend API:** http://localhost:3001/api

### 5. Check Status

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f backend

# View frontend logs only
docker-compose logs -f frontend
```

## Container Management

### Stop the application

```bash
docker-compose down
```

### Restart the application

```bash
docker-compose restart
```

### Rebuild after code changes

```bash
docker-compose up --build -d
```

### Remove everything (including volumes)

```bash
docker-compose down -v
```

## Data Persistence

The SQLite database is stored in a Docker volume at `./backend/data`. This ensures your data persists across container restarts.

To backup your database:

```bash
# Copy database from container
docker cp tracky-backend:/app/data/database.db ./backup.db
```

To restore a database:

```bash
# Copy backup to container
docker cp ./backup.db tracky-backend:/app/data/database.db

# Restart backend
docker-compose restart backend
```

## Production Deployment

### Security Checklist

1. ✅ Change JWT secrets to strong random values
2. ✅ Use environment variables for secrets (never commit them)
3. ✅ Enable HTTPS with a reverse proxy (nginx, Traefik, Caddy)
4. ✅ Set up proper firewall rules
5. ✅ Regular database backups
6. ✅ Update Docker images regularly

### Recommended Production Setup

Use a reverse proxy like Traefik or nginx with Let's Encrypt for SSL:

```yaml
# Example with Traefik labels
services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tracky.rule=Host(`your-domain.com`)"
      - "traefik.http.routers.tracky.tls.certresolver=letsencrypt"
```

## Troubleshooting

### Backend won't start

Check logs:
```bash
docker-compose logs backend
```

### Frontend can't connect to backend

Make sure both containers are on the same network:
```bash
docker network inspect tracky_tracky-network
```

### Database errors

Check if the data directory has proper permissions:
```bash
ls -la backend/data/
```

### Port conflicts

If port 80 or 3001 is already in use, modify `docker-compose.yml`:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change to different port
  backend:
    ports:
      - "3002:3001"  # Change to different port
```

## Development Mode

For development with hot reload, don't use Docker. Instead:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
npm install
npm run dev
```

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ http://localhost
       ▼
┌─────────────────┐
│  Nginx (Port 80)│
│   Frontend      │
└────────┬────────┘
         │ /api/* → http://backend:3001
         ▼
┌─────────────────┐
│ Node.js Backend │
│   (Port 3001)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SQLite DB      │
│  (Volume)       │
└─────────────────┘
```

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend port | `3001` |
| `JWT_SECRET` | Secret for access tokens | **Must set** |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | **Must set** |

## Support

For issues, check the logs first:
```bash
docker-compose logs -f
```

Common issues are usually related to:
- Port conflicts
- Missing environment variables
- Database permissions
