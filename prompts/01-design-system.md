# Prompt 01 — Design System

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
Vaulta is a mobile-first web app targeting 18-24 year-olds. Design philosophy: Duolingo (habits) + Apple Health (progress) + TikTok (visual feedback). NOT a bank app. The scaffold from Prompt 00 exists. Now wire the entire visual foundation before any UI is built.

## Objective
Implement the complete design system: CSS tokens, dark/light mode, global typography, spacing scale, and a minimal set of reusable primitive components. Everything downstream inherits from this — nothing hardcodes a color or font size.

## Design Tokens (`/client/src/styles/tokens.css`)

### Color Palette
```css
:root {
  /* Brand */
  --color-accent-green: #00FF87;
  --color-accent-green-dim: #00CC6A;
  --color-accent-cyan: #00D4FF;
  --color-accent-cyan-dim: #00A8CC;
  --color-gold: #FFD166;
  --color-gold-dim: #E6B84F;

  /* Dark mode defaults */
  --color-bg-primary: #080A12;
  --color-bg-secondary: #10131F;
  --color-bg-card: #161B2E;
  --color-bg-elevated: #1E2438;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-border-accent: rgba(0, 255, 135, 0.3);

  --color-text-primary: #F0F2FF;
  --color-text-secondary: #8892A4;
  --color-text-muted: #4A5568;
  --color-text-inverse: #080A12;

  /* Status */
  --color-success: #00FF87;
  --color-warning: #FFD166;
  --color-error: #FF5C5C;
  --color-info: #00D4FF;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-size-xs: 0.75rem;     /* 12px */
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-base: 1rem;      /* 16px */
  --font-size-md: 1.125rem;    /* 18px */
  --font-size-lg: 1.25rem;     /* 20px */
  --font-size-xl: 1.5rem;      /* 24px */
  --font-size-2xl: 2rem;       /* 32px */
  --font-size-3xl: 2.5rem;     /* 40px */
  --font-size-4xl: 3rem;       /* 48px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  --line-height-tight: 1.1;
  --line-height-snug: 1.3;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.7;

  /* Spacing (4px base) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* Border radius */
  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.4);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-glow-green: 0 0 20px rgba(0, 255, 135, 0.3);
  --shadow-glow-cyan: 0 0 20px rgba(0, 212, 255, 0.3);
  --shadow-glow-gold: 0 0 20px rgba(255, 209, 102, 0.4);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;

  /* Z-index scale */
  --z-base: 0;
  --z-above: 10;
  --z-dropdown: 100;
  --z-modal: 200;
  --z-toast: 300;
  --z-finn: 50;
}
```

### Light Mode Override (`.light` class on `<html>`)
```css
html.light {
  --color-bg-primary: #F0F2FF;
  --color-bg-secondary: #FFFFFF;
  --color-bg-card: #FFFFFF;
  --color-bg-elevated: #E8EBFF;
  --color-border: rgba(0, 0, 0, 0.08);
  --color-border-accent: rgba(0, 150, 100, 0.3);

  --color-text-primary: #0A0C1A;
  --color-text-secondary: #4A5568;
  --color-text-muted: #9AA3B4;
  --color-text-inverse: #F0F2FF;

  --color-accent-green: #00B860;
  --color-accent-cyan: #0095CC;

  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-glow-green: 0 0 20px rgba(0, 184, 96, 0.2);
  --shadow-glow-cyan: 0 0 20px rgba(0, 149, 204, 0.2);
  --shadow-glow-gold: 0 0 20px rgba(230, 160, 40, 0.25);
}
```

## Global Styles (`/client/src/styles/global.css`)
- Import tokens.css
- Import Inter from Google Fonts (weights: 400, 500, 600, 700, 900)
- CSS reset (box-sizing, margin/padding 0, smooth scroll)
- `body`: `background: var(--color-bg-primary)`, `color: var(--color-text-primary)`, `font-family: var(--font-family)`
- `html`: `font-size: 16px` (base), smooth scroll
- Mobile-first: max content width `480px` centered, with side padding `var(--space-4)`
- Scrollbar: thin, styled with `--color-bg-elevated` track and `--color-accent-green` thumb

## Theme Hook (`/client/src/hooks/useTheme.ts`)
- Store theme in `localStorage` key `vaulta-theme`
- Default: detect `prefers-color-scheme`
- Apply class `light` or `dark` on `<html>` element
- Export: `{ theme, toggleTheme }` — no external lib needed

## Primitive Components

### `Button` (`/client/src/components/Button.tsx`)
Variants: `primary` (green glow), `secondary` (border + transparent), `ghost` (no border)
Sizes: `sm`, `md`, `lg`
Props: `variant`, `size`, `loading`, `disabled`, standard HTML button props
- Loading state: spinner replaces label, button disabled
- All transitions via `--transition-fast`
- No inline styles — only CSS classes via `clsx`

### `Card` (`/client/src/components/Card.tsx`)
Props: `variant` (`default` | `elevated` | `glass`), `glow` (`green` | `cyan` | `gold` | none), `padding`, `className`
- `glass`: `backdrop-filter: blur(12px)`, semi-transparent bg
- `glow`: applies matching `--shadow-glow-*`

### `Badge` (`/client/src/components/Badge.tsx`)
Props: `variant` (`success` | `warning` | `info` | `neutral`), `size`
Tiny pill shape, uses accent colors.

### `ProgressBar` (`/client/src/components/ProgressBar.tsx`)
Props: `value` (0–100), `color` (`green` | `cyan` | `gold`), `animated` (shimmer on fill), `label`
- Animated fill transition on mount using CSS animation
- Glow effect on the fill bar

### `Stat` (`/client/src/components/Stat.tsx`)
Props: `label`, `value`, `delta` (optional: `+$0.75`), `deltaType` (`positive` | `negative` | `neutral`)
For displaying currency/XP numbers with small label below and green/red delta.

## What NOT to Build Here
- No routing, no API calls, no auth — this is pure visual foundation
- No Finn animations yet (Prompt 07)
- No page layouts yet

## Acceptance Criteria
- `npm run dev` renders a `/dev` route (or just `App.tsx`) that showcases all tokens and components with both dark/light toggle
- Zero hardcoded colors or font sizes anywhere — every value is a token
- Light/dark toggle persists across refresh
- Inter font loads correctly
- All components are typed with zero TypeScript errors
- Mobile viewport (375px) looks clean — no horizontal scroll, proper padding
