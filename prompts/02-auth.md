# Prompt 02 — Authentication

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
Scaffold (Prompt 00) and design system (Prompt 01) are complete. Now build the full auth layer: backend JWT endpoints + frontend signup/login UI + protected route guard.

## Backend

### Prisma Schema (`/server/prisma/schema.prisma`)
Add the `User` model first (full schema comes in Prompt 03, but auth needs this):
```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  xp           Int      @default(0)
  level        Int      @default(1)
  streakCount  Int      @default(0)
  lastActiveAt DateTime @default(now())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```
Run `npx prisma migrate dev --name init_user`.

### Validation (`/server/src/middleware/validate.ts`)
Zod schemas:
- `signupSchema`: `email` (email format), `password` (min 8 chars)
- `loginSchema`: same fields, no password strength requirement

### Auth Service (`/server/src/services/auth.service.ts`)
- `signup(email, password)`: check email taken → hash with bcrypt (cost 12) → create user → return JWT
- `login(email, password)`: find user → compare hash → return JWT
- `verifyToken(token)`: verify + decode, return `{ userId, email }`
- JWT payload: `{ sub: userId, email }` — no extra fields
- Token expiry from `JWT_EXPIRES_IN` env var

### Auth Controller + Routes (`/server/src/controllers/auth.controller.ts`, `/server/src/routes/auth.ts`)
```
POST /api/auth/signup   → validate(signupSchema) → authController.signup
POST /api/auth/login    → validate(loginSchema) → authController.login
GET  /api/auth/me       → requireAuth middleware → return user without passwordHash
```

### `requireAuth` Middleware (`/server/src/middleware/auth.ts`)
- Extract `Authorization: Bearer <token>`
- Verify JWT → attach `req.user = { userId, email }` to request
- On failure: 401 `{ error: "Unauthorized" }`

### Error Handler (`/server/src/middleware/errorHandler.ts`)
- Catch async errors: return structured `{ error: message, code? }` JSON
- Map Prisma unique constraint violation to 409

## Frontend

### API Layer (`/client/src/lib/api.ts`)
- Axios instance: `baseURL: import.meta.env.VITE_API_URL`
- Request interceptor: attach `Authorization: Bearer <token>` from localStorage
- Response interceptor: on 401 → clear token + redirect to `/login`

### Auth Store (`/client/src/features/auth/auth.store.ts`)
Zustand store:
```ts
interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login(email: string, password: string): Promise<void>
  signup(email: string, password: string): Promise<void>
  logout(): void
  initialize(): void  // hydrate from localStorage on app start
}
```
- Persist `token` to `localStorage` key `vaulta-token`
- `initialize()` called once on app mount: if token exists, fetch `/api/auth/me` to hydrate user

### Pages

#### `LoginPage` (`/client/src/pages/Login.tsx`)
Layout:
- Centered card (max-width 400px), mobile fills full width
- Vaulta logo text (bold, `--color-accent-green`) + tagline below
- Email input + password input + "Sign in" Button (primary, full width)
- Link: "No account? Start with Finn →" → `/signup`
- Error message inline below the form (not toast)
- Loading state on button during request

#### `SignupPage` (`/client/src/pages/Signup.tsx`)
Layout:
- Same card pattern
- Email + password + "Create account" button
- Password strength: show `--color-accent-green` bar only when 8+ chars (no complex rules)
- Link: "Already have an account? Sign in" → `/login`
- On success → redirect to `/onboarding` (not `/dashboard`)

### Route Guard (`/client/src/components/ProtectedRoute.tsx`)
- If no token/user → redirect to `/login`
- While `isLoading` (initializing) → show full-screen Vaulta logo spinner (using `--color-accent-green` animated ring)

### Router Setup (`/client/src/App.tsx`)
```
/             → redirect to /dashboard if authed, else /login
/login        → LoginPage (public)
/signup       → SignupPage (public)
/onboarding   → OnboardingPage (protected — placeholder for now)
/dashboard    → DashboardPage (protected — placeholder for now)
/investments  → InvestmentsPage (protected — placeholder for now)
```

## Design Requirements
- Input fields: `background: var(--color-bg-secondary)`, `border: 1px solid var(--color-border)`, focus state uses `--color-border-accent` + `--shadow-glow-green`
- Form card: `Card` component with `variant="elevated"`, no `glow`
- All colors/sizes use design tokens only
- Both dark and light mode look polished

## Acceptance Criteria
- `POST /api/auth/signup` creates user, returns JWT
- `POST /api/auth/login` returns JWT with wrong password → 401
- `GET /api/auth/me` with valid token returns user (no passwordHash)
- Frontend: signup → auto-login → redirect to `/onboarding`
- Frontend: login → redirect to `/dashboard`
- Refresh page on `/dashboard` with valid token → stay on dashboard (token hydrated)
- Refresh with no/expired token → redirect to `/login`
- Zero TypeScript errors
