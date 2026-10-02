# Account Planner

A multi-user, web-native reimplementation of a sales pursuit qualification
workbook (a commercial Excel/VBA methodology tool), rebuilt as a modern
web app.
Each user manages their own customer accounts; every account gets the full
toolset: opportunity qualification, a qualification matrix, a competitive
advantage profile, an advantage blueprint radar, a pursuit tracker, and an
action planner. All scoring logic reproduces the source workbook exactly,
including its quirks (see src/lib/formulas.ts).

Stack: vinext (Next.js App Router semantics on Vite) on Cloudflare Workers,
Cloudflare D1, Cloudflare Access (one-time PIN) for authentication. No
app-level auth code; identity comes from the verified Access JWT.

## Layout

```
app/                      App Router pages and server actions
  pursuit/[id]/...         per-account tools (qualifier, matrix, profiler, blueprint, tracker, planner, help)
migrations/                D1 schema migrations
scripts/gen-seed-sql.mjs   generates scripts/seed.sql + scripts/seed-batch.json from src/seed/acme-corp.json
src/lib/workbook-config.ts  GENERATED question text, options, scores, bands (do not hand-edit)
src/lib/formulas.ts       pure reimplementation of every workbook computation
src/lib/tooltips.ts       field guidance copy + dropdown option sets
src/lib/db.ts              the ONLY module that talks to D1; everything owner-scoped
src/components/            client editors, SVG charts, forms, tooltips
proxy.ts                  Cloudflare Access JWT verification (Next.js 16 proxy file)
cloudflare.config.ts       Worker + D1 binding + Access vars
```

## Commands

```sh
pnpm install
pnpm test            # vitest: formula fidelity against the workbook fixture
pnpm run dev         # vite dev server on workerd (http://localhost:3000)
pnpm run build       # production build
pnpm run deploy      # build + deploy to Cloudflare Workers
```

## Local development

- Identity: dev builds skip Access and act as the email in
  `.env.local` (`VITE_DEV_USER_EMAIL`; falls back to dev@example.com).
  Switch it to impersonate another user and verify per-user isolation.
  The bypass is compile-time only (`import.meta.env.DEV`) and cannot be
  enabled in production.
- The local D1 database is a miniflare sqlite file under
  `.cloudflare/state/v3/d1/`. Apply the schema and seed with:

  ```sh
  DBF=$(find .cloudflare/state/v3/d1 -name '*.sqlite' ! -name 'metadata*')
  sqlite3 "$DBF" < migrations/0001_init.sql
  sqlite3 "$DBF" < scripts/seed.sql   # ACME Corp demo account, owner demo@example.com
  ```

- To reset to the pristine seed: DELETE FROM qual_snapshots,
  profiler_snapshots, vulnerability_actions, action_items, pursuits; then
  re-run seed.sql.

## Seed data

`src/seed/acme-corp.json` is a fully anonymised demo account ("ACME Corp",
fictional people, no vendor names). The numeric fixture matches the source
workbook exactly (qualifier totals 1 and 7; profile sections 13/13/12/4/12/0;
total 54; Pursuit Score 40%) and doubles as the regression fixture for the
formula unit tests. Regenerate the SQL with:

```sh
node scripts/gen-seed-sql.mjs demo@example.com   # owner email argument
```

## Deploying your own instance

1. Create a D1 database and put its binding name in `cloudflare.config.ts`
   (the config ships with `account-planner-db`; adjust to your database
   name and account ID).
2. Apply the schema and seed:
   `pnpm exec cf d1 migrations apply <DATABASE_ID>` and import
   scripts/seed.sql.
3. In Cloudflare Zero Trust, create a self-hosted Access application for
   your hostname with the One-time PIN identity provider, and an allow
   policy for the emails (or email domains) you want. Note its AUD tag and
   your team domain (`<team>.cloudflareaccess.com`).
4. Put the team domain and AUD into the `ACCESS_TEAM_DOMAIN` /
   `ACCESS_APP_AUD` vars in `cloudflare.config.ts`, attach a custom domain
   (the config ships with `workersDev: false` so the Access policy cannot
   be bypassed via workers.dev), then `pnpm run deploy`.
5. Verify: your hostname should 302 to the Access login; unauthenticated
   API access returns 401 from the proxy.

## Access and identity

- proxy.ts verifies the Cloudflare Access JWT (issuer = the team domain,
  audience = this app's AUD tag) using the team's public JWKS, then
  injects the verified email as the request owner identity. Server code
  reads identity only through requireOwner() in src/lib/auth.ts.
- ACCESS_TEAM_DOMAIN and ACCESS_APP_AUD in cloudflare.config.ts are public
  identifiers, not secrets.

## Methodology

Account Planner uses qualification and competitive-advantage concepts
inspired by the Revenue Storm sales methodology (single attribution line;
all tool and score names in the app are generic).

## Known faithful quirks

- The Pursuit Score formula (total/120, floor 15%, else minus 5%) dips just
  above the floor - reproduced as-is.
- The qualifier traffic light is forced red when both totals are zero (no
  analysis), matching the dashboard macro, even though the raw weighted
  score would be amber.
- Radar vertex order, matrix axes, and 0..20 clamping follow the original
  VBA drawing code.
- A snapshot counts as a recorded evaluation only when it has at least one
  answered score; empty snapshots never plot and never enter history.
- Phase dropdown offers Creating, Shaping, Closing (the first two come from
  the source file; Closing is an app extension) plus free text.
- Planner priority/status and tracker status options follow the source
  workbook's help text.

## License

MIT
