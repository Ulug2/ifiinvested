# Prompt 10 — Polish, Error States, Analytics & Deploy

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

## Context
All features are built (Prompts 00–09). This is the final pass: iron out edge cases, add missing error states, instrument analytics, performance-harden the app, and deploy to production.

## 1. Error States & Empty States

### Global Error Boundary (`/client/src/components/ErrorBoundary.tsx`)
- React class component error boundary
- Catches render errors, shows friendly Finn (NEUTRAL state) + "Something glitched. Reload?" button
- Reports to `console.error` (plug in Sentry here in future)

### API Error Handling
Every React Query hook should handle:
- Network error: "Can't reach the server. Check your connection."
- 401: handled globally by axios interceptor (redirect to login)
- 500: "Something went wrong on our end. Try again."

Error state design: `Card` variant `"default"`, amber left border, `--color-warning` icon, short message, optional retry button.

### Empty States
- Activity feed with 0 transactions: Finn (NEUTRAL) + "Your spending story starts here."
- Wealth Garden with 0 investments: single 🌱 seed + "Your first investment will plant here."
- Milestones with none achieved: padlock icons with encouraging copy

---

## 2. Loading Skeletons
Replace all `isLoading` spinners with skeleton screens (no loading spinner library):

`/client/src/components/Skeleton.tsx`
```tsx
// Props: width, height, borderRadius (defaults to --radius-sm)
// Renders a div with shimmer animation
```

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-bg-secondary) 50%, var(--color-bg-elevated) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-sm);
}
```

Add skeleton variants for:
- `IdentityCardSkeleton`: 3 lines of shimmer
- `TimelineSkeleton`: 4 shimmer blocks in a row
- `ActivityFeedSkeleton`: 5 item skeletons

---

## 3. Performance

### Frontend
- Lazy-load route components with `React.lazy` + `Suspense` (each page = separate chunk)
- Preload fonts in `index.html`: `<link rel="preload" href="..." as="font">`
- Memoize expensive components: `React.memo` on `ActivityFeed`, `WealthGarden`, `FinnCharacter`
- `useCallback` for event handlers passed to memoized children
- `useMemo` for derived values: `xpPercent`, `commitProgress`, projection points

### Backend
- Add response compression: `npm i compression` → `app.use(compression())`
- Add cache headers for projection endpoint: `Cache-Control: private, max-age=60`
- Index all frequently queried columns (already in schema — verify they're present)
- Rate limiting already added in Prompt 00 — verify it's configured: 100 req/15min per IP

---

## 4. Security Hardening

- `helmet()` already applied — verify all headers in production: CSP, HSTS, X-Frame-Options
- Validate all inputs with Zod on every route (audit: any unvalidated endpoints?)
- Ensure `passwordHash` is NEVER returned in any API response (add Prisma `omit` or manual exclusion)
- JWT secret must be ≥ 32 chars — validate on startup: `if (secret.length < 32) throw new Error(...)`
- CORS: `origin: process.env.CLIENT_URL` — not `*`
- Add `express-rate-limit` specifically to auth routes: 10 attempts/15min

---

## 5. Legal Disclaimers

Add on every screen that shows investment data:
```
Simulated data only. Not financial advice. 
Past performance is not indicative of future results.
```
Style: `--font-size-xs`, `--color-text-muted`, centered, bottom of relevant card.

Add a full disclaimer screen accessible from bottom nav: `/disclaimer`
- Plain text, `--color-text-secondary`, `--font-size-sm`
- Links to: (placeholder) Terms of Service, Privacy Policy

---

## 6. Analytics (Lightweight — No External SDK)

### Backend Event Tracking (`/server/src/services/analytics.service.ts`)
Log key events to a simple `AnalyticEvent` table (append-only):

```prisma
model AnalyticEvent {
  id        String   @id @default(cuid())
  userId    String?
  event     String
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([event, createdAt])
}
```

Track:
| Event | When |
|---|---|
| `user.signup` | On signup |
| `user.login` | On login |
| `onboarding.completed` | Step 4 complete |
| `roundup.committed` | Each $5 commit |
| `milestone.hit` | Each milestone |
| `session.daily_open` | Each daily open |

`logEvent(event: string, userId?: string, metadata?: object): Promise<void>` — fire-and-forget (don't await, don't block response).

### Retention Metrics Endpoint
`GET /api/admin/metrics` (no auth guard — use a static secret header for now):
```json
{
  "totalUsers": 42,
  "signupsLast7Days": 8,
  "dailyActiveToday": 12,
  "avgStreakCount": 4.2,
  "totalCommits": 87,
  "milestoneHitRate": 0.34
}
```

---

## 7. PWA (Progressive Web App)

Make the web app installable on mobile (critical for mobile-first feel):

In `/client/public/`:
- `manifest.json`:
  ```json
  {
    "name": "Vaulta",
    "short_name": "Vaulta",
    "description": "Meet Finn, your financial companion",
    "theme_color": "#00FF87",
    "background_color": "#080A12",
    "display": "standalone",
    "orientation": "portrait",
    "start_url": "/",
    "icons": [
      { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
      { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
    ]
  }
  ```
- Create simple icon PNGs: Vaulta "V" lettermark on `--color-bg-primary` background with `--color-accent-green` color
- In `index.html`: `<link rel="manifest" href="/manifest.json">` + `<meta name="theme-color" content="#00FF87">`
- No service worker in v1 (too complex, not needed for demo)

---

## 8. Deployment

### Environment Variables
**Client** (set in Vercel):
```
VITE_API_URL=https://your-railway-app.railway.app
```

**Server** (set in Railway):
```
DATABASE_URL=<neon/supabase postgres url>
JWT_SECRET=<32+ char random string>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-vercel-app.vercel.app
PORT=3001
NODE_ENV=production
```

### Vercel Config (`/client/vercel.json`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
(Required for React Router client-side routing)

### Railway Config (`/server/Procfile` or `railway.toml`):
```
web: npm run build && npx prisma migrate deploy && npm start
```

### Pre-deploy Checklist
- [ ] `npm run build` in `/client` — zero errors, zero warnings
- [ ] `npx tsc --noEmit` in `/server` — zero errors
- [ ] `npx prisma validate` — schema valid
- [ ] All `console.log` debug statements removed from production paths
- [ ] `.env` not committed (check `.gitignore`)
- [ ] `JWT_SECRET` is not the example value
- [ ] CORS `origin` is set to production Vercel URL (not localhost)
- [ ] Rate limiting active
- [ ] Disclaimer copy present on all investment screens

---

## Acceptance Criteria
- App deploys to Vercel + Railway with zero build errors
- New signup → onboarding → dashboard flow works end-to-end in production
- All loading states use skeleton screens (no spinners)
- Error boundary catches and displays friendly message
- App is installable as PWA on iOS Safari + Android Chrome
- `GET /api/admin/metrics` returns real data
- `/disclaimer` page is accessible
- Security headers present in production (test with securityheaders.com)
- Lighthouse mobile score ≥ 85 (performance + accessibility)
- Zero TypeScript errors in both client and server builds
