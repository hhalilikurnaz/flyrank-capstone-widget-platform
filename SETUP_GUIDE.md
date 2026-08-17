# Setup & Deployment Guide

This guide covers setting up and deploying the enhanced Widget Platform with all new professional features.

## Prerequisites

- **Node.js** 20+ and npm
- **Docker** and Docker Compose
- **PostgreSQL** 14+ (via Docker)
- **Git** for version control
- **curl** or Postman for API testing (optional)

## Local Development Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd flyrank-capstone-widget-platform
npm install
```

### 2. Configure Environment

Copy example files and update with your settings:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Backend `.env`**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/widget_platform
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
MAILPIT_PORT=1025
```

**Frontend `.env`**:
```env
VITE_API_BASE_URL=http://localhost:4000
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL and Mailpit (email catcher)
docker compose up -d

# Verify containers are running
docker ps
```

### 4. Apply Database Migrations

```bash
cd backend
npm run prisma:migrate
```

This will apply all migrations including the new schema for API Keys, Webhooks, and Audit Logs.

### 5. Seed Demo Data (Optional)

```bash
npm run --workspace backend seed
```

This creates:
- Demo tenant account (demo@widget-platform.local / demo12345)
- 2 sample widgets
- 18 sample submissions

### 6. Start Development Servers

In separate terminal windows:

```bash
# Terminal 1: Backend API (http://localhost:4000)
npm run dev:backend

# Terminal 2: Frontend Dashboard (http://localhost:5173)
npm run dev:frontend

# Terminal 3 (Optional): Customer site demo (http://localhost:5500)
npm run dev:customer-site
```

### 7. Access the Application

- **Dashboard**: http://localhost:5173
- **API**: http://localhost:4000
- **API Docs**: See README.md for endpoint list
- **Email Catcher**: http://localhost:8025 (Mailpit)

## Database Migrations

### View All Migrations

```bash
ls backend/prisma/migrations/
```

### Current Schema Includes

- ✅ Tenant (accounts)
- ✅ Widget (forms)
- ✅ Submission (leads)
- ✅ Impression (pageviews)
- ✅ **ApiKey** (programmatic access)
- ✅ **Webhook** (real-time events)
- ✅ **WebhookLog** (delivery tracking)
- ✅ **AuditLog** (activity tracking)

### Rolling Back Migrations (if needed)

```bash
cd backend
npm run prisma:migrate:dev -- --name "rollback_name"
```

⚠️ **Warning**: This is destructive and will lose data. Use only in development.

## Testing the New Features

### Test API Keys

```bash
# 1. Create an API key
curl -X POST http://localhost:4000/api/api-keys \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Key",
    "expiresAt": "2027-08-14T00:00:00Z"
  }'

# Response will include the full key (only shown once):
# {
#   "id": "...",
#   "key": "sk_live_...",
#   "keyPreview": "sk_live_...&....",
#   ...
# }

# 2. Use the API key to access endpoints
curl http://localhost:4000/api/api-keys \
  -H "Authorization: Bearer sk_live_..."

# 3. List all keys
curl http://localhost:4000/api/api-keys \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"

# 4. Revoke a key
curl -X PATCH http://localhost:4000/api/api-keys/{id}/revoke \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"

# 5. Delete a key
curl -X DELETE http://localhost:4000/api/api-keys/{id} \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"
```

### Test Data Export

```bash
# Export as CSV
curl -X POST http://localhost:4000/api/exports/submissions \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format":"csv"}' \
  -o submissions.csv

# Export as JSON
curl -X POST http://localhost:4000/api/exports/submissions \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"format":"json"}' \
  -o submissions.json

# Export with filters
curl -X POST http://localhost:4000/api/exports/submissions \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "widgetId": "widget-uuid-here",
    "startDate": "2026-08-01T00:00:00Z",
    "endDate": "2026-08-14T23:59:59Z"
  }' \
  -o submissions-filtered.csv
```

### Test Webhooks

```bash
# 1. Create a webhook
# First, get a public URL or use webhook.site for testing
curl -X POST http://localhost:4000/api/webhooks \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://webhook.site/unique-id",
    "events": ["submission.created"]
  }'

# 2. Test webhook delivery
curl -X POST http://localhost:4000/api/webhooks/{id}/test \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"

# 3. View webhook logs
curl http://localhost:4000/api/webhooks/{id}/logs \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"

# 4. Update webhook
curl -X PATCH http://localhost:4000/api/webhooks/{id} \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "events": ["submission.created", "submission.flagged"]
  }'

# 5. Delete webhook
curl -X DELETE http://localhost:4000/api/webhooks/{id} \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"
```

### Test Audit Logs

```bash
# View all audit logs
curl http://localhost:4000/api/audit-logs \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"

# Get statistics
curl http://localhost:4000/api/audit-logs/stats \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"

# Filter logs with pagination
curl "http://localhost:4000/api/audit-logs?page=1&limit=50&action=widget.create" \
  -H "Authorization: Bearer $YOUR_JWT_TOKEN"
```

## Running Tests

```bash
# Backend tests (integration tests with real DB)
npm run test --workspace backend

# Frontend tests
npm run test --workspace frontend

# Linting
npm run lint --workspace backend
npm run lint --workspace frontend
```

## Building for Production

### Backend Build

```bash
cd backend
npm run build
npm run start
```

### Frontend Build

```bash
cd frontend
npm run build
# Output in dist/
```

### Docker Build (Optional)

Create a `Dockerfile` for containerized deployment:

```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend ./backend
RUN npm install
WORKDIR /app/backend
CMD ["npm", "start"]
```

## Production Deployment

### Prerequisites for Production

1. **PostgreSQL Database**: Use managed service (AWS RDS, Azure Database, Heroku Postgres)
2. **Environment Variables**: Set securely (use secrets manager)
3. **Email Service**: Replace Mailpit with SendGrid, AWS SES, or similar
4. **Domain**: Register domain and configure DNS
5. **SSL/TLS**: Get certificate (Let's Encrypt recommended)

### Configuration Checklist

```bash
# Update production environment variables
PRODUCTION_DATABASE_URL=postgresql://...
JWT_SECRET=<generate-strong-secret>
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production

# Disable seeding in production
# Update seed.ts to skip in production
```

### Deployment Steps

1. **Deploy Database Migrations**
   ```bash
   npm run prisma:migrate:deploy
   ```

2. **Deploy Backend**
   ```bash
   # Via Docker:
   docker build -t widget-platform-api:latest .
   docker push your-registry/widget-platform-api:latest

   # Or via traditional hosting:
   npm run build
   npm run start
   ```

3. **Deploy Frontend**
   ```bash
   # Build static assets
   npm run build
   # Upload dist/ to CDN or static host
   ```

4. **Health Checks**
   ```bash
   curl https://api.yourdomain.com/health
   # Should respond with: {"status":"ok","uptime":...}
   ```

## Monitoring & Maintenance

### Key Metrics to Monitor

- API response time
- Database query performance
- Webhook delivery success rate
- Audit log volume
- Storage usage

### Regular Maintenance

```bash
# Weekly: Check error logs
docker compose logs backend | grep ERROR

# Monthly: Database optimization
npm run prisma:db:pull  # Verify schema

# Quarterly: Clean old audit logs (optional)
npm run prisma:db:execute -- "DELETE FROM \"AuditLog\" WHERE \"createdAt\" < now() - interval '1 year'"
```

## Troubleshooting

### Common Issues

#### "Connection refused" error

```bash
# Check if PostgreSQL is running
docker compose ps

# Restart if needed
docker compose restart postgres
```

#### "Migration already applied" error

```bash
# Check migration status
npm run prisma:migrate:status

# Reset (development only!)
npm run prisma:db:reset
```

#### "JWT token invalid"

```bash
# Verify JWT_SECRET is consistent
# Re-login to generate new token
```

#### Webhooks not delivering

```bash
# Check webhook logs
curl http://localhost:4000/api/webhooks/{id}/logs \
  -H "Authorization: Bearer $TOKEN"

# Verify URL is accessible
curl -X POST https://your-webhook-url \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check firewall/network rules
```

## Support & Resources

### Documentation
- **API Docs**: See [README.md](./README.md) for endpoint list
- **Feature Guide**: See [FEATURES.md](./FEATURES.md) for detailed feature info
- **Architecture**: See [DESIGN.md](./DESIGN.md) for system design

### Getting Help
1. Check the FEATURES.md for feature-specific help
2. Review application logs: `docker compose logs backend`
3. Verify database: `docker compose exec postgres psql -U user -d widget_platform`

### Performance Tips

- Use API keys instead of session tokens for programmatic access
- Batch webhook events to reduce delivery load
- Archive audit logs regularly to maintain performance
- Use indexes on commonly filtered columns

## Security Checklist

- ✅ Change default database password
- ✅ Rotate JWT_SECRET regularly
- ✅ Enable HTTPS in production
- ✅ Validate all API key usage
- ✅ Monitor audit logs for suspicious activity
- ✅ Use webhook signatures to verify authenticity
- ✅ Store secrets in secure vault (not in code)
- ✅ Enable database backups
- ✅ Set up rate limiting (already configured)
- ✅ Keep dependencies updated

## Next Steps

1. ✅ Complete local setup
2. ✅ Test all new features
3. ✅ Customize branding (logo, colors)
4. ✅ Set up production database
5. ✅ Configure email service
6. ✅ Deploy to staging
7. ✅ Run security audit
8. ✅ Deploy to production
9. ✅ Monitor and maintain

Congratulations! You have a professional SaaS platform ready for deployment.
