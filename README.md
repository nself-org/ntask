# nApp

**The "code once, deploy everywhere" boilerplate for modern applications.**

A production-ready monorepo boilerplate with a self-hosted backend (nSelf) and a universal Next.js frontend. Build your backend with Docker + Hasura + Postgres, build your frontend with any AI agent or by hand, deploy to any platform.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## What Is This?

This is a **boilerplate**, not a finished application. It provides:

- A complete **backend stack** (PostgreSQL + Hasura + Auth + Storage) that runs anywhere Docker runs
- A universal **frontend app** (Next.js + TypeScript + Tailwind) that deploys to web, desktop, and mobile
- A **backend abstraction layer** so you can swap between nSelf, Supabase, Nhost, or Bolt without changing application code
- Full compatibility with **AI coding agents** (Bolt.new, Lovable, AI Assistant, Cursor, Copilot, etc.)

Clone it. Configure it. Build your app on top of it.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Backend (`/backend`)](#backend)
5. [Frontend (Root)](#frontend)
6. [Backend Providers](#backend-providers)
7. [Environment Configuration](#environment-configuration)
8. [Using with AI Agents](#using-with-ai-agents)
9. [Deployment Guide](#deployment-guide)
10. [Customization Checklist](#customization-checklist)
11. [Platform Targets](#platform-targets)
12. [Developer Tools](#developer-tools)
13. [Scripts Reference](#scripts-reference)
14. [Tech Stack](#tech-stack)
15. [Contributing](#contributing)

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                         YOUR APP                                 |
+------------------------------------------------------------------+
|                                                                  |
|  /backend                        /  (frontend)                   |
|  ┌──────────────────────┐        ┌────────────────────────────┐  |
|  │ PostgreSQL 16        │        │ Next.js 13 (App Router)    │  |
|  │ Hasura GraphQL Engine│ <----> │ Backend Abstraction Layer  │  |
|  │ Hasura Auth (JWT)    │        │ React 18 + TypeScript      │  |
|  │ Hasura Storage (S3)  │        │ Tailwind CSS + shadcn/ui   │  |
|  │ MinIO (Object Store) │        │ Offline-first (IndexedDB)  │  |
|  │ Traefik (HTTPS)      │        │ PWA + Desktop (Tauri)      │  |
|  └──────────────────────┘        └────────────────────────────┘  |
|                                                                  |
|  Runs on: VPS, bare metal,      Deploys to: Vercel, Netlify,     |
|  Docker, localhost               self-hosted, Tauri, PWA         |
+------------------------------------------------------------------+
```

The key insight: **your frontend code never imports backend SDKs directly.** Everything goes through a unified abstraction layer with hooks like `useAuth`, `useQuery`, `useMutation`, `useStorage`, and `useRealtime`. Change your backend provider with a single environment variable.

---

## Quick Start

### Option A: Full Stack (Recommended)

Start the self-hosted backend and frontend together:

```bash
# 1. Clone the repo
git clone https://github.com/acamarata/nself-app.git
cd nself-app

# 2. Start the backend (requires Docker)
cd backend
cp .env.example .env           # Edit passwords/secrets for production
make up                        # Starts PostgreSQL, Hasura, Auth, Storage, MinIO
cd ..

# 3. Start the frontend
cp .env.local.example .env.local  # Points to local backend
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) -- your app is running.
Open [http://localhost:8080/console](http://localhost:8080/console) -- Hasura Console for your database.

### Option B: Frontend Only (Bolt.new / Supabase)

If using Bolt.new or Supabase as your backend, you don't need Docker:

```bash
git clone https://github.com/acamarata/nself-app.git
cd nself-app

cp .env.example .env
# Set NEXT_PUBLIC_BACKEND_PROVIDER=bolt (or supabase)
# Set your Supabase URL and anon key

pnpm install
pnpm dev
```

### Option C: AI Agent Development

Open this repo in Bolt.new, Lovable, or any AI coding agent. The `.bolt/prompt`, `.cursorrules`, and project configuration tell the agent exactly how this codebase works. See [Using with AI Agents](#using-with-ai-agents) for details.

---

## Project Structure

```
nself-app/
│
├── backend/                          # BACKEND - Self-hosted nSelf stack
│   ├── docker-compose.yml            # Local dev stack (Postgres, Hasura, Auth, Storage)
│   ├── docker-compose.staging.yml    # Staging overlay (adds Traefik HTTPS)
│   ├── docker-compose.production.yml # Production overlay (adds backups, limits)
│   ├── .env.example                  # Backend environment template
│   ├── Makefile                      # Quick commands (make up, make down, etc.)
│   ├── postgres/
│   │   └── init.sql                  # Database initialization (schemas, tables, triggers)
│   └── hasura/
│       ├── config.yaml               # Hasura CLI configuration
│       ├── metadata/                 # GraphQL schema, permissions, actions
│       └── migrations/               # Database migrations
│
├── app/                              # FRONTEND - Next.js App Router pages
│   ├── layout.tsx                    # Root layout (providers, fonts, metadata)
│   ├── page.tsx                      # Landing page
│   ├── login/page.tsx                # Login page
│   ├── register/page.tsx             # Registration page
│   ├── dashboard/page.tsx            # Dashboard (protected)
│   ├── todos/page.tsx                # Todos example (protected)
│   ├── account/page.tsx              # Account settings (protected)
│   ├── forgot-password/page.tsx      # Password reset
│   ├── sitemap.ts                    # Auto-generated sitemap
│   └── api/                          # API routes
│       ├── health/route.ts           # Health check endpoint
│       └── hello/route.ts            # Example API route
│
├── components/                       # FRONTEND - React components
│   ├── auth/                         # Auth forms, protected route wrapper
│   ├── dashboard/                    # Dashboard cards, status indicators
│   ├── layout/                       # Header, footer, sidebar, app shell
│   ├── todos/                        # Todo list, create form, item
│   ├── profile/                      # Profile edit form
│   ├── skins/                        # Desktop/mobile platform wrappers
│   └── ui/                           # shadcn/ui components (40+ components)
│
├── lib/                              # FRONTEND - Core libraries
│   ├── config.ts                     # Backend provider + environment config
│   ├── app.config.ts                 # App branding, SEO, theme, social links
│   ├── auth-config.ts                # Auth method configuration
│   ├── env.ts                        # Runtime environment detection
│   ├── backend/                      # Multi-provider abstraction layer
│   │   ├── index.ts                  # Backend factory (picks provider)
│   │   ├── nself/                    # nSelf adapter (Hasura + Auth + Storage)
│   │   ├── supabase/                 # Supabase adapter
│   │   └── nhost/                    # Nhost adapter
│   ├── providers/                    # React contexts
│   │   ├── auth-provider.tsx         # Auth state, signIn/signOut/signUp
│   │   ├── backend-provider.tsx      # Backend client singleton
│   │   ├── theme-provider.tsx        # Light/dark mode
│   │   └── offline-provider.tsx      # Offline detection + queue
│   ├── services/                     # Business logic wrappers
│   │   ├── todos.ts                  # Todo CRUD operations
│   │   └── profile.ts                # Profile + avatar operations
│   ├── types/                        # TypeScript interfaces
│   │   └── backend.ts                # AuthAdapter, DatabaseAdapter, etc.
│   ├── offline/                      # Offline-first utilities
│   └── platform/                     # Platform detection, native APIs
│
├── hooks/                            # FRONTEND - Custom React hooks (20+)
│   ├── use-query.ts                  # Data fetching with cache
│   ├── use-mutation.ts               # Insert/update/delete
│   ├── use-realtime.ts               # WebSocket subscriptions
│   ├── use-storage.ts                # File upload/download
│   ├── use-toast.ts                  # Toast notifications
│   └── ...                           # Debounce, pagination, keyboard, etc.
│
├── public/                           # Static assets (replace with your own)
│   ├── icon.svg                      # App icon (placeholder)
│   ├── logo.svg                      # Logo light mode (placeholder)
│   ├── logo-dark.svg                 # Logo dark mode (placeholder)
│   ├── og-image.svg                  # Social sharing image (placeholder)
│   ├── manifest.json                 # PWA manifest
│   └── robots.txt                    # Search engine rules
│
├── src-tauri/                        # DESKTOP - Tauri desktop app config
│   ├── tauri.conf.json               # Window size, permissions, bundle ID
│   └── src/main.rs                   # Tauri entry point
│
├── scripts/
│   └── seed.ts                       # Database seeding script
│
├── e2e/                              # End-to-end tests (Playwright)
├── tests/                            # Unit test setup (Vitest)
│
├── .env                              # Active environment (gitignored)
├── .env.example                      # Full env reference with all providers
├── .env.local.example                # nSelf local dev template
├── .env.staging.example              # Staging template
├── .env.production.example           # Production template
│
├── .bolt/prompt                      # Bolt.new AI instructions
├── .cursorrules                      # Cursor AI instructions
│
├── middleware.ts                     # Auth middleware (route protection)
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── docker-compose.yml                # Frontend-only Docker (for deployment)
├── Dockerfile                        # Frontend Docker build
├── netlify.toml                      # Netlify deployment config
└── package.json                      # Dependencies and scripts
```

---

## Backend

The `/backend` directory contains the complete nSelf backend stack. It runs PostgreSQL, Hasura GraphQL Engine, Hasura Auth, Hasura Storage, and MinIO -- all orchestrated with Docker Compose.

**Full documentation: [`backend/README.md`](backend/README.md)**

### TL;DR

```bash
cd backend
cp .env.example .env         # Configure passwords and secrets
make up                      # Start everything
make status                  # Check health
make console                 # Open Hasura Console (database admin)
make psql                    # PostgreSQL shell
make logs                    # View logs
make down                    # Stop everything
```

### Key Endpoints

| Service         | Local URL                          | Description              |
| --------------- | ---------------------------------- | ------------------------ |
| GraphQL API     | `http://localhost:8080/v1/graphql` | Hasura GraphQL endpoint  |
| Hasura Console  | `http://localhost:8080/console`    | Database admin UI        |
| Auth Service    | `http://localhost:4000`            | Authentication API       |
| Storage Service | `http://localhost:8484`            | File upload/download API |
| MinIO Console   | `http://localhost:9001`            | Object storage admin     |
| PostgreSQL      | `localhost:5432`                   | Direct database access   |
| Mailhog         | `http://localhost:8025`            | Local email testing UI   |

### Environments

| Environment    | Command           | Features                                                     |
| -------------- | ----------------- | ------------------------------------------------------------ |
| **Local**      | `make up`         | All ports exposed, Hasura Console enabled, Mailhog for email |
| **Staging**    | `make staging-up` | Traefik HTTPS, Console disabled, real SMTP                   |
| **Production** | `make prod-up`    | HTTPS, backups, resource limits, no dev tools                |

---

## Frontend

The root directory IS the frontend -- a Next.js 13 application with App Router.

### Key Files to Customize

| File                        | What to Change                                                                  |
| --------------------------- | ------------------------------------------------------------------------------- |
| `lib/app.config.ts`         | App name, tagline, description, branding paths, theme colors, social links, SEO |
| `.env` / `.env.local`       | Backend provider, URLs, API keys                                                |
| `public/icon.svg`           | App icon (replace with your own SVG)                                            |
| `public/logo.svg`           | Logo for light mode                                                             |
| `public/logo-dark.svg`      | Logo for dark mode                                                              |
| `public/og-image.svg`       | Social sharing image (convert to PNG for production)                            |
| `public/manifest.json`      | PWA name, colors, icons                                                         |
| `app/globals.css`           | Theme colors (CSS custom properties)                                            |
| `tailwind.config.ts`        | Tailwind theme extensions                                                       |
| `src-tauri/tauri.conf.json` | Desktop app window, bundle ID, permissions                                      |
| `middleware.ts`             | Protected routes, auth redirects                                                |

### Authentication

Built-in email/password auth. Enable additional methods in `lib/auth-config.ts`:

```typescript
configureAuthMethods({
  'email-password': true, // Default, always available
  'magic-link': false, // Passwordless email
  google: false, // Google OAuth
  github: false, // GitHub OAuth
  apple: false, // Apple Sign In
});
```

### Using the Backend Abstraction

**Never import backend SDKs directly.** Always use the hooks and providers:

```typescript
// Auth
import { useAuth } from '@/lib/providers';
const { user, signIn, signOut, signUp } = useAuth();

// Database queries
import { useQuery, useMutation } from '@/hooks';
const { data, loading, error } = useQuery('todos');
const { mutate: createTodo } = useMutation('todos', 'insert');

// File storage
import { useStorage } from '@/hooks';
const { upload, uploading } = useStorage('avatars');

// Real-time
import { useRealtime } from '@/hooks';
useRealtime('messages', payload => {
  /* handle event */
});
```

---

## Backend Providers

Switch backend by changing one environment variable:

```bash
NEXT_PUBLIC_BACKEND_PROVIDER=nself      # Self-hosted (DEFAULT)
NEXT_PUBLIC_BACKEND_PROVIDER=supabase   # Supabase (cloud or self-hosted)
NEXT_PUBLIC_BACKEND_PROVIDER=bolt       # Bolt.new cloud sandbox
NEXT_PUBLIC_BACKEND_PROVIDER=nhost      # Nhost (managed Hasura)
```

### Comparison

| Feature          | nSelf                        | Supabase                    | Nhost                        | Bolt                  |
| ---------------- | ---------------------------- | --------------------------- | ---------------------------- | --------------------- |
| **Database**     | Hasura GraphQL over Postgres | PostgREST over Postgres     | Hasura GraphQL over Postgres | PostgREST (managed)   |
| **Auth**         | Hasura Auth (JWT)            | Supabase Auth (JWT)         | Hasura Auth (JWT)            | Supabase Auth (JWT)   |
| **Storage**      | MinIO (S3-compatible)        | Supabase Storage (S3)       | Hasura Storage (S3)          | Supabase Storage (S3) |
| **Realtime**     | WebSocket (Hasura)           | Supabase Channels           | GraphQL Subscriptions        | Supabase Channels     |
| **Functions**    | Custom (Next.js API routes)  | Edge Functions (Deno)       | Serverless Functions         | Edge Functions (Deno) |
| **Hosting**      | Any Docker host              | Supabase Cloud or self-host | Nhost Cloud                  | Bolt.new sandbox      |
| **Cost**         | Infrastructure cost only     | Free tier + paid            | Free tier + paid             | Free tier + paid      |
| **Data Control** | Full (you own everything)    | Depends on plan             | Depends on plan              | Limited               |
| **Offline**      | Full (WebSocket reconnect)   | Partial (polling)           | Full (subscriptions)         | Partial               |

### When to Use Which

- **nSelf**: You want full control, own your data, self-host everything. Best for production apps where you need to scale on your own terms.
- **Supabase**: You want a managed service with a generous free tier. Great for prototyping and small-to-medium apps.
- **Nhost**: You want managed Hasura without running your own infrastructure. Good balance of control and convenience.
- **Bolt**: You're prototyping in Bolt.new and want instant backend. Switch to nSelf or Supabase when going to production.

---

## Environment Configuration

### File Hierarchy

Environment files are loaded in this order (later files override earlier ones):

```
.env                  # Base defaults (committed to repo)
.env.local            # Local overrides (gitignored)
.env.staging          # Staging-specific
.env.production       # Production-specific
```

### Complete Variable Reference

```bash
# ===== CORE =====
NEXT_PUBLIC_BACKEND_PROVIDER=nself    # nself | bolt | supabase | nhost
NEXT_PUBLIC_ENVIRONMENT=local         # local | staging | production
NEXT_PUBLIC_PLATFORM=web              # web | desktop | mobile

# ===== APP METADATA =====
NEXT_PUBLIC_APP_NAME=MyApp            # Shown in header, title, manifest
NEXT_PUBLIC_APP_TAGLINE=              # Subtitle on landing page
NEXT_PUBLIC_APP_DESCRIPTION=          # Meta description, manifest
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Canonical URL
NEXT_PUBLIC_APP_VERSION=0.1.0         # Shown in footer/dashboard
NEXT_PUBLIC_DEBUG=false               # Enable debug logging

# ===== NSELF BACKEND =====
NEXT_PUBLIC_NSELF_GRAPHQL_URL=        # Hasura GraphQL endpoint
NEXT_PUBLIC_NSELF_GRAPHQL_WS_URL=     # Hasura WebSocket endpoint
NEXT_PUBLIC_NSELF_HASURA_ADMIN_SECRET= # Hasura admin secret (dev only!)
NEXT_PUBLIC_NSELF_AUTH_URL=           # Hasura Auth endpoint
NEXT_PUBLIC_NSELF_STORAGE_URL=        # Hasura Storage endpoint
NEXT_PUBLIC_NSELF_REALTIME_URL=       # WebSocket for subscriptions
NEXT_PUBLIC_NSELF_FUNCTIONS_URL=      # Custom functions endpoint

# ===== SUPABASE / BOLT =====
NEXT_PUBLIC_SUPABASE_URL=             # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # Supabase anonymous key

# ===== NHOST =====
NEXT_PUBLIC_NHOST_SUBDOMAIN=          # Nhost project subdomain
NEXT_PUBLIC_NHOST_REGION=             # Nhost region
NEXT_PUBLIC_NHOST_BACKEND_URL=        # Nhost backend URL
NEXT_PUBLIC_NHOST_GRAPHQL_URL=        # Nhost GraphQL endpoint
NEXT_PUBLIC_NHOST_GRAPHQL_WS_URL=     # Nhost WebSocket endpoint
NEXT_PUBLIC_NHOST_AUTH_URL=           # Nhost auth endpoint
NEXT_PUBLIC_NHOST_STORAGE_URL=        # Nhost storage endpoint
NEXT_PUBLIC_NHOST_FUNCTIONS_URL=      # Nhost functions endpoint
NEXT_PUBLIC_NHOST_ADMIN_SECRET=       # Nhost admin secret (dev only!)
```

### Environment Templates

| File                      | Use Case                          | Provider |
| ------------------------- | --------------------------------- | -------- |
| `.env.example`            | Complete reference, all variables | All      |
| `.env.local.example`      | Local development                 | nSelf    |
| `.env.staging.example`    | Staging server                    | nSelf    |
| `.env.production.example` | Production deployment             | nSelf    |

---

## Using with AI Agents

This boilerplate is designed to work with AI coding assistants. Each agent gets instructions via configuration files that teach it the project architecture.

### Bolt.new

The `.bolt/prompt` file contains instructions for Bolt. When you open this project in Bolt.new:

1. Bolt reads the prompt and understands the abstraction layer
2. It knows to use hooks like `useAuth`, `useQuery`, `useMutation` instead of raw SDK calls
3. It respects the component structure and file organization

**To develop in Bolt.new:**

1. Import this repo into Bolt.new
2. The `.env` ships with `NEXT_PUBLIC_BACKEND_PROVIDER=bolt` and Supabase credentials for the cloud sandbox
3. Start building -- Bolt will use the Supabase backend automatically
4. When ready for production, switch to `nself` and deploy the backend stack

**What to tell Bolt:**

```
This project uses the nApp boilerplate with a backend abstraction layer.
Never import @supabase/supabase-js or any backend SDK directly.
Use hooks from @/hooks and @/lib/providers for all operations.
See .cursorrules for the full coding guide.
```

### Lovable

Lovable works similarly. Import the repo and tell it:

```
This is an nApp boilerplate project. The backend is abstracted behind
hooks and providers in lib/backend, lib/providers, and hooks/.
Never use backend SDKs directly. Use useAuth(), useQuery(), useMutation(),
useStorage(), and useRealtime() hooks.
Components use shadcn/ui, Tailwind CSS, and Lucide React icons.
```

### AI Assistant (AI Company)

When using AI Assistant (via API, claude.ai, or AI Code):

```
I'm working on an nApp project. It has a backend abstraction layer.
The key files are:
- lib/backend/index.ts (backend factory)
- lib/types/backend.ts (TypeScript interfaces)
- lib/providers/ (React contexts)
- hooks/ (data hooks)
- .cursorrules (full coding guide)

Never import backend SDKs. Use the abstraction layer hooks.
```

### Cursor IDE

The `.cursorrules` file is automatically loaded by Cursor. It contains:

- Complete coding guidelines
- Import rules (always use abstraction layer)
- Component structure patterns
- File organization rules
- Code examples for auth, queries, mutations, storage, realtime
- Do's and don'ts

Just open the project in Cursor and start coding. The rules are applied automatically.

### GitHub Copilot

Add this to your repository's `.github/copilot-instructions.md` (or use the built-in `.cursorrules`):

```
This project uses a backend abstraction layer.
All database operations use hooks from @/hooks (useQuery, useMutation).
Authentication uses useAuth from @/lib/providers.
Never import @supabase/supabase-js, graphql-request, or other SDKs directly.
```

### Windsurf / Aider / Other Agents

Most AI agents read project files for context. Point them to:

1. `.cursorrules` -- Complete coding rules
2. `lib/types/backend.ts` -- The abstraction interfaces
3. `lib/backend/index.ts` -- How providers are selected
4. `hooks/index.ts` -- Available hooks

---

## Deployment Guide

### Frontend Deployment

#### Vercel (Recommended for Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_BACKEND_PROVIDER=nself
# NEXT_PUBLIC_ENVIRONMENT=production
# NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql
# ... (all NSELF variables pointing to your production backend)
```

#### Netlify

```bash
npm i -g netlify-cli
netlify deploy --build
```

The `netlify.toml` is pre-configured.

#### Docker (Self-Hosted Frontend)

```bash
docker build -t myapp-frontend .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_PROVIDER=nself \
  -e NEXT_PUBLIC_NSELF_GRAPHQL_URL=https://api.yourdomain.com/v1/graphql \
  myapp-frontend
```

### Backend Deployment

#### Local Development

```bash
cd backend
cp .env.example .env
make up          # Starts all services on localhost
```

#### Staging (VPS with HTTPS)

```bash
cd backend
# Edit .env with staging passwords and domain
make staging-up  # Starts with Traefik HTTPS
```

**Prerequisites:**

- VPS with Docker (Ubuntu 22.04+ recommended)
- DNS pointing `api.staging.yourdomain.com`, `auth.staging.yourdomain.com`, `storage.staging.yourdomain.com` to VPS IP
- Ports 80 and 443 open

#### Production (VPS with HTTPS + Backups)

```bash
cd backend
# Edit .env with STRONG passwords and real SMTP
make prod-up     # Starts with HTTPS, backups, resource limits
```

**Prerequisites:**

- Production VPS (4+ GB RAM recommended)
- DNS A records for `api.yourdomain.com`, `auth.yourdomain.com`, `storage.yourdomain.com`
- Real SMTP provider (Resend, Postmark, SendGrid, or AWS SES)
- Strong passwords in `.env` (change ALL defaults!)

### Full Stack Deployment Map

```
                    ┌───────────────────────────────────────────────┐
                    │               PRODUCTION                      │
                    │                                               │
                    │  Frontend (Vercel/Netlify/CDN)                │
                    │  └── NEXT_PUBLIC_BACKEND_PROVIDER=nself       │
                    │  └── Points to api.yourdomain.com             │
                    │                                               │
                    │  Backend (VPS / Docker)                       │
                    │  └── api.yourdomain.com     (Hasura GraphQL)  │
                    │  └── auth.yourdomain.com    (Authentication)  │
                    │  └── storage.yourdomain.com (File Storage)    │
                    │  └── Traefik handles HTTPS automatically      │
                    │  └── Daily PostgreSQL backups                 │
                    └───────────────────────────────────────────────┘

                    ┌───────────────────────────────────────────────┐
                    │               STAGING                         │
                    │                                               │
                    │  Frontend (Vercel preview / VPS)              │
                    │  └── NEXT_PUBLIC_ENVIRONMENT=staging          │
                    │  └── Points to api.staging.yourdomain.com     │
                    │                                               │
                    │  Backend (Same or separate VPS)               │
                    │  └── api.staging.yourdomain.com               │
                    │  └── auth.staging.yourdomain.com              │
                    │  └── storage.staging.yourdomain.com           │
                    └───────────────────────────────────────────────┘

                    ┌───────────────────────────────────────────────┐
                    │               LOCAL DEV                       │
                    │                                               │
                    │  Frontend: pnpm dev (localhost:3000)          │
                    │  Backend:  make up     (localhost:8080, etc.) │
                    │  Email:    Mailhog     (localhost:8025)       │
                    └───────────────────────────────────────────────┘
```

---

## Customization Checklist

When you clone this boilerplate to start a real app, work through this list:

### 1. Branding

- [ ] Replace `public/icon.svg` with your app icon
- [ ] Replace `public/logo.svg` with your logo (light mode)
- [ ] Replace `public/logo-dark.svg` with your logo (dark mode)
- [ ] Replace `public/og-image.svg` with your social sharing image (convert to PNG, 1200x630)
- [ ] Replace `public/apple-touch-icon.svg` with your Apple touch icon
- [ ] Update `public/manifest.json` with your app name, colors, and icons
- [ ] Update `lib/app.config.ts` with your app name, tagline, description, URLs

### 2. Theme

- [ ] Update CSS custom properties in `app/globals.css` (colors, fonts)
- [ ] Update `tailwind.config.ts` if adding custom theme extensions
- [ ] Update `lib/app.config.ts` theme colors (`primaryColor`, `accentColor`)

### 3. Environment

- [ ] Copy `.env.example` to `.env` and set your backend provider
- [ ] If using nSelf: copy `backend/.env.example` to `backend/.env` and set passwords
- [ ] Change ALL default passwords and secrets before any non-local deployment
- [ ] Set up your domain and DNS records for staging/production

### 4. Backend

- [ ] If using nSelf: customize `backend/postgres/init.sql` with your tables
- [ ] Update `backend/hasura/metadata/databases/default/tables/tables.yaml` with permissions
- [ ] If using Supabase: create tables in Supabase Dashboard or via migrations
- [ ] Set up storage buckets for your file types

### 5. Authentication

- [ ] Configure auth methods in `lib/auth-config.ts`
- [ ] Set up OAuth providers if needed (Google, GitHub, Apple, etc.)
- [ ] Update `middleware.ts` with your protected route patterns
- [ ] If using nSelf: configure OAuth in `backend/.env`

### 6. SEO & Legal

- [ ] Update `lib/app.config.ts` SEO settings (title template, keywords, author)
- [ ] Update `public/robots.txt` with your domain
- [ ] Create `/privacy` and `/terms` pages (referenced in `app.config.ts`)
- [ ] Update `app/sitemap.ts` with your actual routes

### 7. Deployment

- [ ] Set up Vercel/Netlify project with environment variables
- [ ] If self-hosting backend: set up VPS, DNS, and SSL
- [ ] Configure real SMTP (Resend, Postmark, etc.) for production emails
- [ ] Set up monitoring and alerts

### 8. Cleanup

- [ ] Remove example todo components if not using them (`components/todos/`, `app/todos/`)
- [ ] Remove the skins showcase page (`app/skins/`)
- [ ] Update this README.md with your own project documentation
- [ ] Remove example e2e tests and write your own
- [ ] Update `.wiki/Changelog.md` with your version history
- [ ] Update `package.json` name, description, author, repository

---

## Platform Targets

### Web (Default)

Standard Next.js web application. Works out of the box with any hosting provider.

### Desktop (Tauri)

Build native desktop apps for Windows, macOS, and Linux:

```bash
# Install Rust (one-time)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Development
pnpm build
cd src-tauri
cargo tauri dev

# Build distributable
cargo tauri build
```

Configure in `src-tauri/tauri.conf.json`:

- Window size and title
- Bundle identifier (e.g., `com.yourcompany.yourapp`)
- Allowed APIs (filesystem, notifications, clipboard, etc.)
- App icons

### PWA (Progressive Web App)

Automatically configured with:

- Service worker (`public/sw.js`) for offline caching
- Web app manifest (`public/manifest.json`) for install prompts
- Workbox for cache strategies

Users can install your web app on their home screen.

---

## Developer Tools

### Dev Mode Indicator

A small badge appears in the corner showing the current environment and backend provider. Only visible in `local` and `staging` environments.

### Faux Sign-In

In local development, three test accounts are available on the login page for quick testing without creating real users:

| Email               | Role  |
| ------------------- | ----- |
| `admin@example.com` | Admin |
| `test@example.com`  | User  |
| `demo@example.com`  | Demo  |

This is only available when `NEXT_PUBLIC_ENVIRONMENT=local`.

### Health Check

`GET /api/health` returns backend connectivity status and latency.

### Hasura Console

When running nSelf locally, the Hasura Console at `http://localhost:8080/console` provides:

- Visual table editor
- GraphQL playground
- Permission manager
- Migration tools

---

## Scripts Reference

### Frontend Scripts

| Command              | Description                               |
| -------------------- | ----------------------------------------- |
| `pnpm dev`           | Start development server (localhost:3000) |
| `pnpm build`         | Production build                          |
| `pnpm start`         | Start production server                   |
| `pnpm lint`          | Run ESLint                                |
| `pnpm lint:fix`      | Auto-fix lint errors                      |
| `pnpm format`        | Format all files with Prettier            |
| `pnpm typecheck`     | TypeScript type checking                  |
| `pnpm test`          | Unit tests (watch mode)                   |
| `pnpm test:run`      | Unit tests (single run)                   |
| `pnpm test:coverage` | Unit tests with coverage report           |
| `pnpm test:e2e`      | End-to-end tests (Playwright)             |
| `pnpm test:e2e:ui`   | E2E tests with Playwright UI              |
| `pnpm db:seed`       | Seed the database with sample data        |

### Backend Scripts (Makefile)

| Command                 | Description                        |
| ----------------------- | ---------------------------------- |
| `make up`               | Start all backend services         |
| `make down`             | Stop all services                  |
| `make restart`          | Restart all services               |
| `make logs`             | View all service logs              |
| `make status`           | Show service health                |
| `make health`           | Ping all health endpoints          |
| `make psql`             | Open PostgreSQL shell              |
| `make console`          | Open Hasura Console (requires CLI) |
| `make migrate`          | Apply Hasura migrations            |
| `make metadata-apply`   | Apply Hasura metadata              |
| `make backup`           | Create database backup             |
| `make restore FILE=...` | Restore from backup                |
| `make staging-up`       | Start staging stack                |
| `make prod-up`          | Start production stack             |
| `make clean`            | Remove all data (destructive!)     |

---

## Tech Stack

| Category       | Technology                  | Purpose                          |
| -------------- | --------------------------- | -------------------------------- |
| **Framework**  | Next.js 13                  | App Router, SSR, API routes      |
| **Language**   | TypeScript 5                | Type safety (strict mode)        |
| **Styling**    | Tailwind CSS 3              | Utility-first CSS                |
| **Components** | shadcn/ui                   | 40+ accessible components        |
| **Icons**      | Lucide React                | 1000+ SVG icons                  |
| **Forms**      | React Hook Form + Zod       | Validation and submission        |
| **State**      | React Context + Hooks       | No external state library        |
| **Database**   | PostgreSQL 16               | Via Hasura or Supabase           |
| **GraphQL**    | Hasura + graphql-request    | For nSelf and Nhost              |
| **Auth**       | Hasura Auth / Supabase Auth | JWT-based authentication         |
| **Storage**    | MinIO / Supabase Storage    | S3-compatible file storage       |
| **Desktop**    | Tauri v2                    | Native desktop apps              |
| **PWA**        | Workbox                     | Offline support, install prompts |
| **Offline**    | idb-keyval (IndexedDB)      | Client-side data caching         |
| **Testing**    | Vitest + Playwright         | Unit and E2E tests               |
| **Linting**    | ESLint + Prettier           | Code quality and formatting      |
| **Git Hooks**  | Husky + lint-staged         | Pre-commit checks                |
| **Commits**    | Commitlint                  | Conventional commit messages     |
| **CI/CD**      | GitHub Actions              | Automated testing and deployment |
| **Deploy**     | Docker + Traefik            | Self-hosted with auto HTTPS      |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](.wiki/Contributing.md) before submitting PRs.

For complete documentation, visit the [Wiki](https://github.com/acamarata/nself-app/wiki).

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Write code following `.cursorrules` guidelines
4. Test across at least two backend providers
5. Submit a pull request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Credits

Built by the nSelf community.

Part of the **n ecosystem**:

- [nSelf](https://github.com/acamarata/nself) - Self-hosted backend stack
- [nApp](https://github.com/acamarata/nself-app) - Application boilerplate (this repo)
- [nChat](https://github.com/acamarata/nself-chat) - Real-time chat application
