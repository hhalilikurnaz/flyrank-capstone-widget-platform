# Professional SaaS Features

This document describes the professional-grade features added to make the Widget Platform a production-ready SaaS product.

## 1. API Keys Management

**Status**: ✅ Fully Implemented

### Overview
Allow users to create and manage API keys for programmatic access to their account.

### Features
- **Create API Keys**: Generate unique, secure API keys with optional expiration dates
- **List & Search**: View all active and revoked API keys
- **Revoke Keys**: Disable compromised keys without deleting them
- **Delete Keys**: Permanently remove API keys from the system
- **Track Usage**: Monitor last-used timestamp for each key
- **Key Preview**: Display safe preview (first 8 + last 4 characters) in UI

### Technical Details
- Backend: `/backend/src/modules/api-keys/`
- Frontend: `/frontend/src/pages/ApiKeysPage.tsx`
- Database: `ApiKey` table in Prisma schema
- Authentication: `requireApiKeyAuth` middleware in `src/middleware/apiKeyAuth.ts`
- Uses bcryptjs for secure hashing
- Prefix: `sk_live_` for all keys

### API Endpoints
```
GET    /api/api-keys              - List all API keys
POST   /api/api-keys              - Create new API key
PATCH  /api/api-keys/:id/revoke   - Revoke an API key
DELETE /api/api-keys/:id          - Delete an API key
```

### Usage
1. Navigate to "API Keys" in the dashboard sidebar
2. Click "Create API Key"
3. Enter a name and optional expiration date
4. Copy the key immediately (it won't be shown again)
5. Use in API requests: `Authorization: Bearer sk_live_...`

---

## 2. Data Export

**Status**: ✅ Fully Implemented

### Overview
Export all submissions data in CSV or JSON format for analysis, backup, or integration with external tools.

### Features
- **Multiple Formats**: Export as CSV or JSON
- **Filter by Widget**: Export submissions from specific widgets
- **Date Range**: Filter by creation date (optional)
- **Automatic Naming**: Files automatically named with export date
- **Complete Data**: Includes all submission fields, location data, and metadata
- **Flattened JSON**: CSV properly handles nested data structures

### Technical Details
- Backend: `/backend/src/modules/exports/`
- Frontend: `/frontend/src/lib/exports.ts`
- Export service handles CSV generation with proper escaping
- JSON exports include full submission objects with metadata

### API Endpoints
```
POST /api/exports/submissions - Download submissions as CSV or JSON
```

### Request Format
```json
{
  "format": "csv" | "json",
  "widgetId": "optional-uuid",
  "startDate": "2026-08-01T00:00:00Z",
  "endDate": "2026-08-14T23:59:59Z"
}
```

### Usage in UI
1. Navigate to "Submissions" page
2. Click "Export" button (dropdown menu)
3. Select CSV or JSON format
4. File downloads automatically

---

## 3. Audit Logs

**Status**: ✅ Fully Implemented

### Overview
Track all actions in your account for security, compliance, and investigation purposes.

### Features
- **Action Logging**: Automatic logging of all important actions
- **Detailed Records**: Includes action type, entity, changes, and IP address
- **Change Tracking**: Log what fields were modified and how
- **Statistics**: View total logs and activity trends
- **Searchable**: Filter by action type and date range
- **Color-Coded**: Visual indicators for different action types

### Technical Details
- Backend: `/backend/src/modules/audit-logs/`
- Frontend: `/frontend/src/pages/AuditLogsPage.tsx`
- Database: `AuditLog` table
- Service: Helper function `logAudit()` for easy integration

### Logged Actions
- `user.login` - User authentication
- `user.logout` - User session end
- `widget.create` - New widget created
- `widget.update` - Widget configuration changed
- `widget.delete` - Widget removed
- `submission.view` - Submission accessed
- `api-key.create` - New API key created
- `api-key.revoke` - API key disabled
- `export.download` - Data exported

### API Endpoints
```
GET /api/audit-logs       - List all audit logs with pagination
GET /api/audit-logs/stats - Get activity statistics
```

### Usage
1. Navigate to "Audit Logs" (in Settings or via URL `/audit-logs`)
2. View all activity with detailed timestamps
3. Click on logs to see what changed
4. Monitor for suspicious activity

---

## 4. Webhooks

**Status**: ✅ Fully Implemented (Backend Complete)

### Overview
Send real-time notifications to your systems when important events occur.

### Features
- **Event Subscriptions**: Subscribe to specific events
- **Webhook Testing**: Test webhook delivery before going live
- **Delivery Logs**: Track all webhook deliveries with status codes
- **Retry Logic**: Automatic retry for failed deliveries
- **Signature Verification**: HMAC-SHA256 signatures for authenticity
- **Multiple Events**: Support for different event types

### Supported Events
- `submission.created` - New form submission received
- `submission.flagged` - Submission marked as spam

### Technical Details
- Backend: `/backend/src/modules/webhooks/`
- Database: `Webhook` and `WebhookLog` tables
- Signature: `X-Webhook-Signature` header (HMAC-SHA256)
- Event header: `X-Webhook-Event`

### API Endpoints
```
GET    /api/webhooks           - List all webhooks
POST   /api/webhooks           - Create new webhook
PATCH  /api/webhooks/:id       - Update webhook
DELETE /api/webhooks/:id       - Delete webhook
GET    /api/webhooks/:id/logs  - View delivery logs
POST   /api/webhooks/:id/test  - Test webhook delivery
```

### Webhook Payload Format
```json
{
  "event": "submission.created",
  "timestamp": "2026-08-14T16:14:28Z",
  "data": {
    "id": "submission-id",
    "widgetId": "widget-id",
    "data": { /* form fields */ },
    "country": "TR",
    "city": "Istanbul"
  }
}
```

### Webhook Headers
```
POST /your-endpoint
Content-Type: application/json
X-Webhook-Event: submission.created
X-Webhook-Signature: sha256=abcd1234...
```

### Verification Example
```javascript
const crypto = require('crypto');
const signature = req.headers['x-webhook-signature'];
const payload = req.rawBody; // Raw request body

const computed = crypto
  .createHmac('sha256', process.env.WEBHOOK_SECRET)
  .update(payload)
  .digest('hex');

if (computed !== signature) {
  throw new Error('Invalid signature');
}
```

---

## 5. Database Schema Enhancements

### New Tables

#### ApiKey
```sql
CREATE TABLE "ApiKey" (
  id         TEXT PRIMARY KEY
  tenantId   TEXT REFERENCES Tenant(id)
  name       TEXT
  keyHash    TEXT UNIQUE
  lastUsedAt TIMESTAMP
  expiresAt  TIMESTAMP
  isActive   BOOLEAN DEFAULT true
  createdAt  TIMESTAMP
)
```

#### Webhook
```sql
CREATE TABLE "Webhook" (
  id        TEXT PRIMARY KEY
  tenantId  TEXT REFERENCES Tenant(id)
  url       TEXT
  events    TEXT[]
  isActive  BOOLEAN DEFAULT true
  secret    TEXT
  createdAt TIMESTAMP
  updatedAt TIMESTAMP
)
```

#### WebhookLog
```sql
CREATE TABLE "WebhookLog" (
  id        TEXT PRIMARY KEY
  webhookId TEXT REFERENCES Webhook(id)
  tenantId  TEXT REFERENCES Tenant(id)
  event     TEXT
  payload   JSONB
  status    INTEGER
  response  TEXT
  error     TEXT
  attempts  INTEGER DEFAULT 1
  nextRetry TIMESTAMP
  createdAt TIMESTAMP
)
```

#### AuditLog
```sql
CREATE TABLE "AuditLog" (
  id        TEXT PRIMARY KEY
  tenantId  TEXT REFERENCES Tenant(id)
  action    TEXT
  entity    TEXT
  entityId  TEXT
  changes   JSONB
  ipAddress TEXT
  createdAt TIMESTAMP
)
```

### Migration
- File: `backend/prisma/migrations/20260814161428_add_api_keys_webhooks_audit_logs/migration.sql`
- Run: `npm run prisma:migrate` (or `docker compose exec -it backend npm run prisma:migrate`)

---

## 6. Frontend UI Components

### New Pages
- **ApiKeysPage** (`/api-keys`) - Manage API keys
- **AuditLogsPage** (`/audit-logs`) - View audit logs
- **WebhooksPage** (pending) - Manage webhooks

### Enhanced Components
- **SubmissionsTable** - Added dropdown export menu with CSV/JSON options
- **Layout** - Added navigation links for new pages

---

## 7. Authentication & Security

### API Key Authentication
```typescript
// Middleware: src/middleware/apiKeyAuth.ts
requireApiKeyAuth(req, res, next)
```

Use for protecting endpoints that need API key access:
```typescript
app.post("/api/some-endpoint", requireApiKeyAuth, handler);
```

### HMAC Signature Verification
For webhooks and integrations:
```typescript
verifyWebhookSignature(secret, payload, signature)
```

---

## 8. Migration & Deployment

### Steps to Deploy New Features

1. **Update Database**
   ```bash
   cd backend
   npm run prisma:migrate
   ```

2. **Environment Variables**
   - No new env vars required for these features
   - Existing JWT_SECRET and DATABASE_URL sufficient

3. **Restart Services**
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```

4. **Test Features**
   - Create test API key
   - Export submissions
   - Check audit logs
   - (Webhooks: manual testing via API)

---

## 9. Future Enhancements

These features build the foundation for:

### Team Management
- Invite users to workspace
- Role-based access control (RBAC)
- Per-user audit logs
- Shared API keys with revocation

### Advanced Webhooks
- Webhook retry strategy customization
- Conditional delivery (filter events)
- Webhook request transformation
- Webhook monitoring dashboard

### Better Analytics
- Webhook delivery metrics
- API key usage analytics
- Audit log insights
- Trend analysis

### Compliance
- GDPR export/delete endpoints
- SOC 2 audit trails
- Data retention policies
- Encryption at rest for sensitive data

---

## 10. Testing

### API Key Tests
```bash
# Create a key
curl -X POST http://localhost:4000/api/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"test"}'

# Use the key
curl http://localhost:4000/api/api-keys \
  -H "Authorization: Bearer sk_live_..."
```

### Export Tests
```bash
# Export as CSV
curl -X POST http://localhost:4000/api/exports/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"format":"csv"}' \
  > submissions.csv

# Export as JSON
curl -X POST http://localhost:4000/api/exports/submissions \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"format":"json"}' \
  > submissions.json
```

### Audit Logs
```bash
# View logs
curl http://localhost:4000/api/audit-logs \
  -H "Authorization: Bearer $TOKEN"

# View stats
curl http://localhost:4000/api/audit-logs/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Webhooks
```bash
# Create webhook
curl -X POST http://localhost:4000/api/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "url":"https://your-server.com/webhook",
    "events":["submission.created"]
  }'

# Test webhook
curl -X POST http://localhost:4000/api/webhooks/:id/test \
  -H "Authorization: Bearer $TOKEN"

# View logs
curl http://localhost:4000/api/webhooks/:id/logs \
  -H "Authorization: Bearer $TOKEN"
```

---

## Summary

The Widget Platform now includes enterprise-grade features:
- ✅ **API Keys** for programmatic access
- ✅ **Data Export** in multiple formats
- ✅ **Audit Logs** for compliance and security
- ✅ **Webhooks** for real-time integrations

These features make the platform suitable for serious commercial use and enterprise deployments.
