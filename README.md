# Daemon

An AI-powered email intelligence platform. Turns emails into actions.

## Project Structure

```
daemon/
├── frontend/   — Next.js 15 app (UI + API routes)
├── backend/    — Business logic, Prisma schema, integrations
├── shared/     — Shared types and constants
├── docs/       — Architecture documents
└── scripts/    — Seed and utility scripts
```

## Getting Started

### 1. Install dependencies

```bash
cd frontend
npm install
```

### 2. Set up environment variables

```bash
cp frontend/.env.example frontend/.env.local
# Fill in all required values
```

### 3. Set up the database

```bash
cd frontend
npm run db:push      # Create tables in Neon
npm run db:generate  # Generate Prisma client
```

### 4. Run the development server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See `frontend/.env.example` for all required variables.

## Tech Stack

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Auth:** Clerk
- **Database:** PostgreSQL (Neon) + Prisma
- **AI:** Gemini API
- **Email:** Gmail API
- **Deployment:** Vercel
