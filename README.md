# 🏔️ DiscoveryCappadocia

A premium, full-stack travel booking platform for Cappadocia experiences — balloon flights, daily tours, activities, and transfers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| State | Zustand |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Real-time | WebSocket |
| Payments | Stripe, iyzico |
| Auth | JWT (bcrypt) |

## Project Structure

```
discovery-cappadocia/
├── backend/
│   ├── prisma/          # Schema & seed
│   ├── src/
│   │   ├── routes/      # auth, tours, bookings, payments, availability, admin
│   │   ├── middleware/   # errorHandler, auth
│   │   ├── lib/         # prisma, redis helpers
│   │   ├── websocket.ts
│   │   └── index.ts     # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/         # Pages: /, /tours, /booking, /dashboard, /admin, /login, /register
│   │   ├── components/  # layout/, sections/, booking/
│   │   ├── store/       # authStore, bookingStore
│   │   ├── lib/         # api, utils
│   │   └── types/
│   └── .env.example
└── docker-compose.yml   # PostgreSQL + Redis
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (for PostgreSQL & Redis)

### 1. Start databases

```bash
docker-compose up -d
```

### 2. Setup backend

```bash
cd backend
cp .env.example .env
# Edit .env with your actual keys (Stripe, iyzico, JWT secret)
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

The API will start at `http://localhost:4000`.

### 3. Setup frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

The app will start at `http://localhost:3000`.

### Default Admin Account

Seeding creates one admin account. See `prisma/seed.ts` for the credentials
(change the password there before seeding a shared/production database).

## Features

### Customer-facing
- **Landing page** — Hero with parallax, experience cards, live availability widget, social proof, interactive map
- **Tours listing** — Category filtering, search
- **7-step booking funnel** — Tour → Date → People → Upsells → Info → Payment → Confirmation
- **Real-time availability** — WebSocket-powered seat updates
- **User dashboard** — Booking history, upcoming trips
- **Dual payment** — Stripe + iyzico integration

### Admin panel
- Dashboard with KPIs (revenue, bookings, conversion)
- Tour management (CRUD, toggle active)
- Booking management with status filters
- Availability & dynamic pricing (bulk set)
- Customer directory
- Revenue analytics with category breakdown

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tours` | List tours |
| GET | `/api/tours/:id` | Tour detail |
| GET | `/api/availability/:tourId` | Get availability |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | User bookings |
| POST | `/api/payments/stripe/create-intent` | Stripe payment |
| POST | `/api/payments/iyzico/create` | iyzico payment |
| GET | `/api/admin/dashboard` | Admin stats |
| GET/POST/PUT | `/api/admin/tours` | Admin tour CRUD |
| GET/PUT | `/api/admin/bookings` | Admin bookings |
| POST | `/api/admin/availability/bulk` | Bulk set availability |

## Environment Variables

### Backend (`.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 4000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `IYZICO_API_KEY` | iyzico API key |
| `IYZICO_SECRET_KEY` | iyzico secret key |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

## License

Private — All rights reserved.
