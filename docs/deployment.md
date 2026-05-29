# Deployment Guide (Railway)

## Prerequisites
- Railway account at railway.app
- GitHub repo connected to Railway
- Domain purchased (connect via Railway custom domain)

## Railway Project Setup

### 1. Create Project
1. New Project → Deploy from GitHub repo → select `YVR-Advisory`
2. Railway will detect both services

### 2. Add PostgreSQL Add-on
- In Railway project → New → Database → PostgreSQL
- `DATABASE_URL` is auto-injected into services in the same project

### 3. Backend Service
- Root directory: `backend/`
- Builder: Dockerfile (auto-detected from `railway.toml`)
- Set env vars (see `backend/.env.example`)
- Custom domain: `api.yourdomain.com`

### 4. Frontend Service
- Root directory: `frontend/`
- Builder: Nixpacks
- Set `NEXT_PUBLIC_API_URL` to backend Railway URL or custom domain
- Custom domain: `yourdomain.com` + `www.yourdomain.com`

### 5. Environment Variables

**Backend**
```
DATABASE_URL=           # auto-injected from Postgres add-on
SECRET_KEY=             # generate with: openssl rand -hex 32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
N8N_WEBHOOK_API_KEY=    # set a strong random key, copy to n8n
FRONTEND_URL=           # https://yourdomain.com
ENVIRONMENT=production
```

**Frontend**
```
NEXT_PUBLIC_API_URL=    # https://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=   # https://yourdomain.com
REVALIDATE_SECRET=      # random key for on-demand ISR revalidation
```

### 6. First Deploy
- Push to `main` branch → Railway auto-deploys both services
- Backend startup runs `alembic upgrade head` then starts uvicorn
- Create first admin user via Railway shell: `python -c "from app.utils.create_admin import create; create('admin@yourdomain.com', 'password')"`

## Auto-Deploy
- Every push to `main` triggers redeploy of both services
- Zero-downtime rolling deploys by default on Railway
