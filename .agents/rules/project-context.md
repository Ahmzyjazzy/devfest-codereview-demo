---
trigger: always_on
---

# Qorelly Leads - Development Guidelines

These guidelines keep the Qorelly Leads codebase consistent, maintainable and secure.

## 1. Code Standards
- **Language**: TypeScript for the React frontend and the Node.js/Express backend. Use strong types; no implicit `any` in new code.
- **Module System**: ES Modules (`"type": "module"` in `package.json`).
- **Database**: `better-sqlite3` for synchronous SQLite access. No ORM; write raw SQL safely.
- **Comments**: one line, at most 50 characters, only where the code is not self-explanatory.

## 2. Naming Conventions
- **React Components**: `PascalCase` (e.g. `LeadsPage`, `StatCard`).
- **Functions & Variables**: `camelCase` (e.g. `saveLead`, `pipelineEstimate`).
- **Types & Interfaces**: `PascalCase` (e.g. `Lead`, `Meeting`, `LeadNote`).
- **API Routes**: kebab-case and plural nouns (e.g. `/api/leads`, `/api/meetings`).
- **Database Tables & Columns**: `snake_case` (e.g. `lead_notes`, `lead_id`, `created_at`).

## 3. Component Patterns
- **Functional Components** with hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
- **Design kit first**: build screens from `src/components/ui` (list-kit, dialog, sheet, select, stat-card). Do not add a second component library.
- **Class names**: use the `cn` helper in `src/lib/cn.ts` (clsx + tailwind-merge).

## 4. Styling Approach
- **Framework**: Tailwind CSS v4 with the tokens in `src/styles/tokens.css`.
- **Buttons**: always `rounded-full`. Inputs, search and selects use 12px radius.
- **No box shadows**: use `ring-1 ring-hairline/[0.06]` hairlines and the gray-100 well against white sheets.
- **Icons**: Solar icons only, through `<Icon name active? />` in `src/components/ui/icon.tsx` (active = bold, inactive = outline). Register new names in `scripts/gen-icons.mjs` and run `npm run icons:gen`.
- **Animations**: `motion/react` for motion; respect reduced motion.
- **Money**: lead `value` is an estimated deal size in whole naira. Format with `formatMoney` (₦). Never call it revenue.

## 5. API Patterns
- **Architecture**: RESTful routes in `server.ts` using Express.
- **Response Format**: JSON via `res.json(...)`.
- **Error Handling**: wrap every database operation and route in `try/catch`. Return `500` with `{ error: "Message" }` on failure and `201` on creation. Never return internal error details to the client.

## 6. Security Practices
- **SQL Injection Prevention**: **always** use parameterized queries via `db.prepare(...).run/all/get(...)`. Never build SQL with string interpolation.
- **Secret Management**: API keys (e.g. `GEMINI_API_KEY`) stay on the server in `.env` and are read via `process.env` in `server.ts` only. Never ship a key to the browser bundle, never hardcode secrets, never commit `.env`.
- **AI Calls**: call Gemini from the server (see `/api/chat`), handle upstream failures, and treat model output as untrusted text.
