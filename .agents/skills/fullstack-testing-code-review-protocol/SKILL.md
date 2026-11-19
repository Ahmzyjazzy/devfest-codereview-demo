---
name: Fullstack Testing & Code Review Protocol
description: A mandatory protocol defining the complete testing and quality assurance workflow to execute before considering any feature complete.
---

# Fullstack Testing & Code Review Protocol

This skill MUST be invoked as the final step of every implementation. Complete this protocol systematically before considering any feature "done". Execute each phase and address any issues found.

## 1. Code Review & Standards Check
Review the implemented code against `.agents/rules/project-context.md`:
- **Typing**: TypeScript types throughout the React frontend and the Express backend. No implicit `any`.
- **Naming Conventions**:
  - React Components: `PascalCase`
  - Functions & Variables: `camelCase`
  - Types & Interfaces: `PascalCase`
  - API Routes: `kebab-case` (plurals)
  - DB Tables & Columns: `snake_case`
- **React Patterns**: functional components and hooks used correctly.
- **Design kit**: screens built from `src/components/ui`; buttons `rounded-full`; no box shadows; Solar icons through `<Icon>` only; `cn` for conditional classes.
- **Money**: estimated values formatted with `formatMoney` (₦) and never labelled revenue.
- **Comments**: one line, at most 50 characters.

## 2. Security & Data Integrity Verification
- **SQL Injection Prevention**: check ALL new database interactions. Parameterized queries (`db.prepare(...).run/all/get(...)`) only. Fail the review immediately if raw SQL uses string interpolation.
- **Secret Management**: no API keys or `.env` values hardcoded, logged, or exposed to the client. Fail the review if any secret can end up in the browser bundle (for example through Vite `define` or a `VITE_` variable).
- **Logging**: no personal data (names, emails, phones) or secrets in logs.

## 3. Backend API Validation
- **Response Format**: endpoints return JSON via `res.json(...)`.
- **Error Handling**: `try/catch` around every database operation and route.
- **Status Codes**: failures return proper codes (e.g. `500` with `{ error: "Message" }`, no internal details); creations return `201`.

## 4. Execution & Functional Testing
- Run `npm run lint` and start the app with `npm run dev`.
- Test the core user flows the feature introduces.
- Confirm UI actions change backend state correctly and handle latency and errors (loading states, error toasts).

## 5. Final Walkthrough Output
- When all checks pass, document what was tested on the frontend and backend, and the results, in `walkthrough.md` (create or update it).

**Execution Directive**: Do not end the implementation phase until every item above is verified. If an issue is found, fix it, then restart this protocol.
