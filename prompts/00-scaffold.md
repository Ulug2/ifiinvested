# Prompt 00 — Project Scaffold

---

## ⚙️ Code Quality Requirements

All generated code must strictly follow:

* Scalable architecture
* Clean and maintainable structure
* High performance (fast execution, optimized rendering)
* Space-efficient implementation
* Professional-grade engineering standards
* No unnecessary complexity or overengineering

You should always prioritize production-quality patterns over quick hacks.

---

## 🔒 Security Requirements

Security is non-negotiable. All code must:

* Validate and sanitize every input at system boundaries — never trust client data
* Use parameterized queries only — no raw SQL string concatenation (Prisma handles this)
* Never expose internal errors, stack traces, or sensitive data in API responses
* Enforce authentication on every protected endpoint — no exceptions
* Store secrets in environment variables only — never hardcode or log them
* Apply rate limiting on all public-facing endpoints
* Follow OWASP Top 10 guidelines — prevent SQLi, XSS, CSRF, broken auth, and insecure direct object references
* Use HTTPS-only headers (HSTS, CSP, X-Frame-Options) in production
* Hash all passwords with bcrypt (cost ≥ 12) — never store plaintext
* Sanitize any data rendered to the DOM to prevent XSS

---

## Context
Building Vaulta: a gamified fintech habit web app. Stack: React (Vite) + TypeScript frontend, Node.js + Express + TypeScript backend, PostgreSQL + Prisma ORM.

## Objective
Scaffold the full monorepo structure — no implementation logic yet, just the correct folder skeleton, configs, and wiring so every future prompt can drop code into the right place.

## What to Build

### Root
```
/Vaulta
  /client          ← React (Vite + TypeScript)
  /server          ← Express + TypeScript
  /shared          ← shared TypeScript types (used by both client and server)
  package.json     ← workspace root with scripts: dev, build
  .gitignore
  .env.example
```

### `/client` — React (Vite + TypeScript)
- Init with `npm create vite@latest client -- --template react-ts`
- Install: `react-router-dom`, `axios`, `@tanstack/react-query`, `zustand`, `clsx`
- Directory structure:
  ```
  /src
    /assets          ← static images, Finn animation JSON
    /components      ← shared UI primitives (Button, Card, Badge, ProgressBar)
    /features        ← feature folders: auth, dashboard, investments, finn, gamification, onboarding
    /hooks           ← custom hooks (useAuth, useFinn, useXP)
    /lib             ← axios instance, react-query client
    /pages           ← route-level components: Home, Login, Signup, Dashboard, Onboarding
    /styles          ← global.css (design tokens), reset.css
    /types           ← re-export from /shared
    main.tsx
    App.tsx          ← router setup
  ```
- Vite config: path aliases `@/` → `src/`
- `tsconfig.json`: strict mode, path alias

### `/server` — Express + TypeScript
- Init: `npm init -y`, install `express`, `@types/express`, `typescript`, `ts-node-dev`, `dotenv`, `jsonwebtoken`, `bcryptjs`, `@prisma/client`, `prisma`, `cors`, `helmet`, `express-rate-limit`, `zod`
- Directory structure:
  ```
  /src
    /controllers     ← thin: parse req, call service, return res
    /routes          ← express Router per domain (auth, transactions, roundups, investments, gamification, finn)
    /services        ← all business logic here
    /middleware      ← auth (JWT verify), error handler, validate (zod)
    /lib             ← prisma client singleton
    /types           ← local server types
    index.ts         ← app bootstrap, listen
    app.ts           ← express app factory (no listen — for testing)
  ```
- `tsconfig.json`: strict, ESNext, outDir `dist/`
- `package.json` scripts: `dev` (ts-node-dev), `build` (tsc), `start` (node dist/)

### `/shared`
- `types/index.ts` — export all shared interfaces: `User`, `Transaction`, `RoundUp`, `VirtualInvestment`, `Milestone`, `FinnState`, `FinnEvent`, `GamificationSnapshot`

### Root `package.json`
- Workspaces: `["client", "server"]`
- Scripts: `dev` runs both concurrently, `build` builds both

### `.env.example`
```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=3001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## Constraints
- TypeScript strict mode everywhere — no `any`
- Prisma client is a singleton (prevent connection pool exhaustion)
- No business logic in controllers
- No implementation beyond scaffold — services are empty files, routes are registered but return 501

## Acceptance Criteria
- `npm run dev` from root starts both client (port 5173) and server (port 3001) without errors
- Client shows Vite default page
- Server `GET /health` returns `{ status: "ok" }`
- All TypeScript compiles clean with zero errors
- `/shared/types/index.ts` exports all domain types matching the DB schema in `brainstorm.md §9`
