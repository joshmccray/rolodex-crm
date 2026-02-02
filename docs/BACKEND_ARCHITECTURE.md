# TwoStory Backend Architecture

## Overview

TwoStory is a real estate CRM that helps agents stay connected with past clients by monitoring nearby home sales and property value changes. The backend is built with Node.js/Express and TypeScript, using PostgreSQL for data storage.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| Authentication | JWT with refresh tokens |
| Email | Resend |
| Background Jobs | node-cron |

---

## Database Schema

The database implements a **multi-tenant architecture** where each brokerage (organization) has isolated data.

### Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Brokerages with encrypted Spark MLS credentials, subscription tier |
| `users` | Agents with roles (owner/admin/agent), linked to organizations |
| `leads` | Properties/contacts with address, location coordinates, temperature |
| `propertyValues` | Historical valuations from RentCast API |
| `nearbySales` | Recently sold properties from Spark MLS |
| `notifications` | Market alerts and value change notifications |
| `apiUsage` | API call tracking per organization for billing |
| `refreshTokens` | JWT refresh token storage with expiry |

### Key Relationships

```
Organization (1) ──► (many) Users
Organization (1) ──► (many) Leads
Lead (1) ──► (many) PropertyValues
Lead (1) ──► (many) NearbySales
Lead (1) ──► (many) Notifications
User (1) ──► (many) Leads (ownership)
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create organization + owner user |
| POST | `/login` | Email/password authentication |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate refresh token |
| POST | `/accept-invite` | Accept team invitation |
| GET | `/me` | Get current user profile |

### Leads (`/api/leads`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List leads (role-filtered) |
| POST | `/` | Create lead with geocoding |
| GET | `/:id` | Lead with value history + nearby sales |
| PUT | `/:id` | Update lead |
| DELETE | `/:id` | Delete lead |
| POST | `/:id/nearby-sales/refresh` | Sync nearby sales from MLS |
| POST | `/:id/value/refresh` | Update property valuation |
| GET | `/:id/value-history` | Historical valuations |
| GET | `/:id/nearby-sales` | Recent sales near property |

### Organization (`/api/organization`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get organization details |
| PUT | `/` | Update organization (admin+) |
| POST | `/spark-credentials` | Set MLS API credentials (owner) |
| GET | `/users` | List team members (admin+) |
| POST | `/users/invite` | Invite new user (admin+) |
| DELETE | `/users/:userId` | Remove user (admin+) |
| GET | `/usage` | API usage stats (admin+) |

### Notifications (`/api/notifications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List notifications (paginated) |
| GET | `/unread-count` | Count of unread |
| PUT | `/:id/read` | Mark as read |
| POST | `/mark-all-read` | Mark all as read |
| DELETE | `/:id` | Delete notification |

### Dashboard (`/api/dashboard`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Lead counts, unread notifications, activity |

---

## External Service Integrations

### Spark MLS (RESO Web API)

Used for fetching recently sold properties near contacts.

- **Authentication**: OAuth 2.0 client credentials flow
- **Rate Limits**:
  - IDX: 1,500 requests / 5 minutes
  - VOW: 4,000 requests / 5 minutes
- **Key Methods**:
  - `getSoldListingsNearby()` - Query sales within radius
  - `searchByAddress()` - Address-based property search
  - `getListingDetails()` - Single listing lookup

### RentCast API

Used for property valuations (Automated Valuation Model).

- **Rate Limit**: 100 requests / minute
- **Key Methods**:
  - `getPropertyValue()` - Get estimated value
  - `getPropertyDetails()` - Full property info
  - `getMarketData()` - Zip code statistics
  - `getComparableSales()` - Nearby comps

### Resend (Email)

Used for sending notification emails.

- **Templates**:
  - Nearby sale alerts
  - Property value change alerts
  - Team invitation emails

---

## Background Jobs

Scheduled tasks run via `node-cron` (production only).

### Nearby Sales Sync
- **Schedule**: Daily at 6:00 AM
- **Process**:
  1. Iterate all organizations
  2. For each lead with `notify_nearby_sales=true`
  3. Query Spark MLS for sales in last 7 days
  4. Create notifications for new sales
  5. Send email alerts

### Property Value Updates
- **Schedule**: Weekly on Sundays at midnight
- **Process**:
  1. Iterate all organizations
  2. For each lead with `notify_value_changes=true`
  3. Query RentCast for current value
  4. Compare to previous value
  5. Create notification if change ≥ 2%

---

## Authentication & Security

### JWT Tokens
- **Access Token**: 7-day expiry (configurable)
- **Refresh Token**: 30-day expiry, stored in DB, rotated on use
- **Payload**: `userId`, `organizationId`, `role`, `email`

### Password Security
- Hashing: bcrypt with 12 salt rounds
- Password changes invalidate all refresh tokens

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| `agent` | Own leads only |
| `admin` | All org leads, manage users |
| `owner` | Everything + API credentials, billing |

### Encryption
- **Algorithm**: AES-256-GCM
- **Use**: Storing Spark MLS credentials per organization
- **Format**: `iv:authTag:encryptedData` (hex encoded)

---

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Authentication
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=64-hex-chars-for-aes-256

# External APIs
SPARK_API_KEY=spark-oauth-client-id
SPARK_API_SECRET=spark-oauth-client-secret
RENTCAST_API_KEY=rentcast-api-key

# Email
RESEND_API_KEY=resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# App
FRONTEND_URL=https://yourdomain.com
PORT=3001
NODE_ENV=production
```

---

## Project Structure

```
server/
├── src/
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Entry point
│   ├── db/
│   │   ├── index.ts        # DB connection
│   │   └── schema.ts       # Drizzle schema
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── leads.routes.ts
│   │   ├── organization.routes.ts
│   │   ├── notifications.routes.ts
│   │   └── dashboard.routes.ts
│   ├── services/
│   │   ├── spark-mls.service.ts
│   │   ├── property-valuation.service.ts
│   │   ├── lead.service.ts
│   │   ├── user.service.ts
│   │   ├── organization.service.ts
│   │   ├── notification.service.ts
│   │   └── email.service.ts
│   ├── jobs/
│   │   ├── index.ts
│   │   ├── sync-nearby-sales.job.ts
│   │   └── update-property-values.job.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── encryption.ts
│   │   ├── geocoding.ts
│   │   └── rate-limiter.ts
│   └── types/
│       └── index.ts
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set Up Database
```bash
npm run db:push    # Push schema to Neon
```

### 4. Run Development Server
```bash
npm run dev        # Starts on port 3001
```

### 5. Run Production
```bash
npm run build
npm start
```

---

## Database Commands

```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema (dev)
npm run db:studio    # Open Drizzle Studio
```

---

## Architecture Decisions

1. **Multi-tenant by Organization**: Data isolation at the brokerage level with role-based access within
2. **Async Background Jobs**: Non-blocking data syncs prevent API timeouts
3. **Encrypted Credentials**: Organization-level API keys stored with AES-256
4. **Value Change Threshold**: 2% minimum change prevents notification fatigue
5. **Rate Limiting**: Per-API limits with in-memory tracking (Redis recommended for production)
6. **Geocoding**: Free Nominatim API for address-to-coordinates conversion
