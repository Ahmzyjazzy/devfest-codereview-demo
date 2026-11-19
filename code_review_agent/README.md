# Code review agent

A security review agent built with the Antigravity SDK. It reads the diff of the current branch against `main` and writes its findings to `code_review.md`.

```bash
export GEMINI_API_KEY=your-key
uv run --project code_review_agent code_review_agent/review_agent.py .
```

It can only read files and run `git` commands. It never changes code.
