# OutcomeOS

**Don't trust the delivery. Verify the outcome.** OutcomeOS compiles tasks into measurable contracts, runs deterministic proof checks for public websites, GitHub repositories and content, and emits SHA-256 integrity receipts. AI suggestions are advisory and fall back safely when Gemini is unavailable.

## Architecture

Next.js App Router route handlers call strict Zod schemas, the contract compiler, isolated verifier modules, deterministic scoring and canonical hashing. Supabase stores owner-scoped records under RLS. The web process never clones or executes audited repositories. See `docs/ARCHITECTURE.md` and `docs/THREAT_MODEL.md`.

## Local setup

1. Install Node 22 and pnpm 11.
2. Copy `.env.example` to `.env.local`; Supabase, Gemini and GitHub credentials are optional for guest deterministic mode.
3. Run `pnpm install --frozen-lockfile`, `pnpm dev`, then open `http://localhost:3000`.
4. Run `pnpm verify` before deployment.

Supabase: create a project, run `supabase/migrations/0001_initial.sql`, enable email magic links, and set the public URL/anon key. Service-role keys remain server-only. Deploy to Vercel, configure the same variables, then smoke-test `/api/health` and both `/api/okx/a2mcp/*` endpoints.

## Security boundaries

Only public unauthenticated targets are supported. Website fetching blocks private/loopback destinations; repository inspection is static via GitHub API. Evidence hashes are not onchain proof. x402 is prepared but disabled. See `KNOWN_LIMITATIONS.md`.

## Demo

Open the landing page, generate the prefilled content contract, remove/edit requirements as needed, lock it, run the proof check, inspect evidence, then export JSON or Markdown. Demo content is labelled.
