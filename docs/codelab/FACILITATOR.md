# Facilitator guide

For the DevFest Ibadan 2026 session leads and helpers running the [attendee codelab](README.md).

## Before the day

- Run the whole attendee guide yourself on a clean fork, on the Wi-Fi you will have at the venue.
- Pre-download for slow networks: put the Node 20 installer, the Antigravity CLI installer and a `node_modules` tarball of this repo on a USB stick.
- Check that `gh repo fork` works from the venue network, and that `api.github.com`, `registry.npmjs.org`, `pypi.org`, `generativelanguage.googleapis.com` and `antigravity.google` are not blocked.
- Fallback: attendees who cannot install tools can use [Cloud Shell](https://ide.cloud.google.com), which has `agy`, `gh` and Node pre-installed. They still need their own fork and key.

## API keys

- Every attendee uses **their own** Gemini key from Google AI Studio.
- Never show a key on the projector, in chat or in screenshots. Do not hand out a shared key.
- If a key is exposed, the owner deletes it in AI Studio straight away.
- The app's AI features (Chat, AI insights, Research lead) are optional and use the same key from `.env`. Research lead uses Google Search and takes 20 to 40 seconds, which is a good moment to explain that the key stays on the server.

## Timing plan (90 minutes)

| Clock | Section | Checkpoint before moving on |
|---|---|---|
| 0:00 | Intro and the scenario | Everyone has GitHub and a Gemini key |
| 0:05 | 1. Before you start | `agy --version`, `uv --version` and `node -v` (v20) work |
| 0:15 | 2. Fork and run the app | App open at localhost:3000 with 25 leads |
| 0:25 | 3. The problem | People can say what each branch adds |
| 0:30 | 4. Case 1: CLI review | `code_review.md` lists SQL injection; the curl injection returns 0 |
| 0:55 | 5. Case 2, part 1: SDK agent | `review_agent.py` writes findings locally |
| 1:15 | 6–7. GitHub Action and PR | PR comment from the AI Security Review check |
| 1:25 | 8. Bonus, then wrap up | PRs closed without merging |

If the room is behind at 0:55, demo section 5 on the projector and let people follow along from `feature/bulk-operations-solution`.

## Common failures

| Symptom | Fix |
|---|---|
| Fork has only `main` | They forked on the website with "main only" ticked. Delete the fork and use `gh repo fork Ahmzyjazzy/devfest-codereview-demo --clone`. |
| PR opened on the workshop repo | They skipped `gh repo set-default`. Close it on GitHub, run the command, reopen. Watch the workshop repo for stray PRs and close them. |
| Action never starts | Actions are off in new forks: Actions tab → enable workflows. |
| Action fails on the review step | Missing `GEMINI_API_KEY` secret in their fork. |
| `npx skills add` fails with `does not provide an export named 'glob'` | They ran the latest installer on Node 20. Use `npx skills@1.5.18 add …` as the guide says. |
| `git commit` fails with `scope may not be empty` | The commitlint hook needs a scope: `fix(server): …` or `feat(agent): …`, as the guide shows. |
| `better-sqlite3` build error | Missing compiler tools; see the troubleshooting section. |
| AI buttons say "AI is not set up" | No key in `.env`, or the server was not restarted after adding it. |
| `agy` asks for sign-in every time | They closed it during setup; run `agy` once and finish sign-in. |
| Review misses an issue | Normal: models vary. Ask a follow-up question, or compare with a neighbour's review. That is part of the lesson. |

## Resetting

- Fresh sample data: stop the server, delete `leads.db`, run `npm run dev`.
- Undo the agent's edits on a branch: `git restore server.ts` (or `git checkout -- .` to discard everything uncommitted).
- Start a section again: `git checkout <branch>` and `git reset --hard origin/<branch>`.

## Answer key

A private answer key listing every planted issue, its location and the fix exists outside this repo. Ask the session lead for it. Do not commit it or post it in the room.

## After the session

- Close any stray PRs and issues opened on `Ahmzyjazzy/devfest-codereview-demo`.
- Remind attendees to close their own PRs without merging and to delete keys they exposed.
- Collect what broke and update this guide and the troubleshooting section.
