# Qorelly Leads · DevFest Ibadan 2026 code review demo

A small leads tracker for a fictional Ibadan caterer, **Ade’s Kitchen**. It is the sample app for the DevFest Ibadan 2026 workshop on reviewing AI-written code with the Antigravity CLI and SDK.

It uses the same API routes, database tables and `server.ts` as the Google codelab sample app it is based on, so the codelab steps work here unchanged. The one addition is `/api/chat`, which keeps the Gemini key on the server. The UI uses the Qorelly V2 design, and the data is set in Nigeria.

## Workshop

Running the DevFest Ibadan 2026 session? Start with the [codelab guide](docs/codelab/README.md). Facilitators: see the [facilitator guide](docs/codelab/FACILITATOR.md).

## What you need

- Node.js 20 (`nvm use` reads `.nvmrc`)
- npm
- Git

No API keys are needed for leads, the dashboard or meetings.

### Optional: turn on Chat

Chat uses Gemini. To turn it on:

```bash
cp .env.example .env
```

Add your key after `GEMINI_API_KEY=` in `.env`, then restart `npm run dev`. The key stays on the server: the browser calls `/api/chat`, and the server calls Gemini. Without a key, the Chat page explains how to set one up and the rest of the app works as normal.

## Run it locally

```bash
git clone https://github.com/Ahmzyjazzy/devfest-codereview-demo.git
cd devfest-codereview-demo
nvm use
npm install
npm run dev
```

Open http://localhost:3000.

The first `npm run dev` creates `leads.db` and fills it with 25 sample leads, 10 meetings and 15 notes. Later runs keep your data. To start again with fresh data, stop the server, delete `leads.db`, then run `npm run dev` again.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Seeds `leads.db` if it is empty, then starts Express with Vite on port 3000 |
| `npm run seed` | Seeds `leads.db` if it is empty, without starting the server |
| `npm run lint` | Type-checks the project with `tsc --noEmit` |
| `npm run build` | Builds the frontend into `dist/` |
| `npm run icons:gen` | Regenerates the bundled Solar icon subset |

## What the app does

- **Leads:** search, status tabs, an estimated-value column and paging. Add, edit and delete leads. Open a lead in a side panel to change its status, add notes, and schedule, edit, complete or delete meetings.
- **Dashboard:** total and open leads, the estimated value of won deals, the estimated pipeline value, and leads by status. Every money figure is a sum of estimated deal sizes. None of it is revenue.
- **Meetings:** every meeting across all leads, with search and Upcoming, Overdue, Completed and All tabs. Schedule a meeting for any lead, then edit, complete or delete it.
- **Chat:** an assistant that answers questions about your leads and meetings. Needs `GEMINI_API_KEY` (see above).

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/leads` | List leads, newest update first |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead and its meetings and notes |
| GET | `/api/leads/:id/notes` | List a lead’s notes |
| POST | `/api/leads/:id/notes` | Add a note |
| GET | `/api/meetings` | List all meetings with lead name and company |
| POST | `/api/meetings` | Schedule a meeting |
| PUT | `/api/meetings/:id` | Update or complete a meeting |
| DELETE | `/api/meetings/:id` | Delete a meeting |
| POST | `/api/chat` | Ask the assistant a question (needs `GEMINI_API_KEY`) |

## Project layout

```
server.ts              Express API, SQLite schema and Vite middleware
seed-database.js       Creates tables and seeds an empty leads.db
seed-data.sql          Sample leads, meetings and notes
src/components/ui/     Design kit ported from Qorelly V2
src/features/leads/    Leads list, form, detail sheet, notes and meetings
src/features/dashboard/ Pipeline dashboard
src/features/meetings/ Meetings across all leads
src/features/chat/     Sales assistant chat
src/features/shell/    App frame, rail and top bar
src/lib/               API client, formatting and icon helpers
```

## Contributing

Commits follow Conventional Commits with a scope (`repo`, `ui`, `server`, `db` or `docs`), for example `feat(ui): add lead filters`. A commitlint hook checks every message.

## Credits and licence

This app is derived from [alphinside/leads-crm-app-demo](https://github.com/alphinside/leads-crm-app-demo), the sample app for the Google codelab. It is licensed under the Apache License 2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE).

The design comes from Qorelly by Core Technologies LTD. Icons are from [Solar](https://www.figma.com/community/file/1166831539721848736) by 480 Design, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), and bundled through Iconify. All names, businesses, emails and phone numbers in the seed data are made up.
