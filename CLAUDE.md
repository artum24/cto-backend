# CTO Backend — Project Context for Claude

## What This Is

NestJS + GraphQL backend for a **multi-tenant SaaS** platform for car service stations (СТО). Each company is an isolated tenant. The frontend is a separate repo.

**Tech stack:** NestJS 10, GraphQL (code-first, Apollo), Prisma ORM, PostgreSQL (Supabase), TypeScript, Supabase Auth (JWT).

---

## Domain Model

```
companies (tenant root)
├── users            — employees; roles: admin (1) | user (2)
├── clients          — car owners
│   └── vehicles     — cars belonging to a client
│       └── tasks    — service jobs (work orders)
│           ├── vehicle_histories  — services performed in a task
│           ├── detail_histories   — parts used/returned in a task
│           └── invoices           — generated invoice for a task
├── storages         — warehouses (one per company by default)
│   ├── categories   — part categories within a storage
│   ├── supliers     — parts suppliers (scoped to storage)
│   └── details      — spare parts inventory
│       └── detail_histories
├── services         — global catalog of service types (no company_id)
├── reports          — XLSX import job results
├── invitations      — pending member invitations (by email)
└── workspaces       — physical workspaces/bays (not yet exposed via API)
```

**Multi-tenancy enforcement chain:**
`task → vehicle → client → company_id` (most ownership checks traverse this chain)
`detail / category / suplier → storage → company_id`

---

## Auth

- Supabase Auth (JWT). Every request requires `Authorization: Bearer <token>`.
- Guard: `SupabaseAuthGuard` — validates JWT locally (if `SUPABASE_JWT_SECRET` set) or via Supabase admin API.
- Decorator: `@CurrentUser()` → `AuthContextUser { authUserId, user, authUser }`.
- `user.company_id` — the tenant the current user belongs to.
- Decorator `@AllowUnregisteredAppUser()` — skips the "user must have a DB profile" check (used for onboarding flows).

---

## Project Structure

```
src/
├── auth/                    — JWT guard, Supabase client, decorators
├── common/
│   ├── enums/
│   ├── filters/             — GraphQL exception filter
│   ├── guards/              — rate-limit guard
│   ├── mappers/             — bigintToString (BigInt → string for GraphQL)
│   └── scalars/             — BigInt scalar
├── prisma/                  — PrismaService + module
└── modules/
    ├── company/             — company CRUD, invitations
    ├── user/                — accept/decline invitation, user profile
    ├── client/              — client CRUD + archive
    ├── vehicle/             — vehicle CRUD + search/filter/pagination
    ├── tasks/               — work orders
    ├── vehicle-history/     — service records per task
    ├── services/            — global service catalog
    ├── storage/             — warehouse management
    ├── categories/          — part categories
    ├── supliers/            — suppliers (storage-scoped)
    ├── details/             — inventory (parts)
    ├── invoice/             — PDF invoice generation (REST + GraphQL)
    ├── upload/              — XLSX client import
    ├── report/              — import job results
    └── nova-poshta/         — Nova Poshta address lookup
```

---

## Key Conventions

- **BigInt IDs everywhere** — DB uses `BigInt` PKs. GraphQL exposes them as `String`. Always convert with `BigInt(id)` on input, `bigintToString()` on output.
- **Resolvers are thin** — only extract args, apply guards, call service. No business logic.
- **Services own business logic** — authorization checks, transactions, domain rules.
- **Ownership checks** — every service method that touches tenant data must verify `company_id`. Pattern: `findFirst({ where: { id, company_id } })` or traverse the chain.
- **Prisma transactions** — use `prisma.$transaction()` for multi-step writes.
- **Error types** — use NestJS HTTP exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`), not raw `Error`.
- **`bigintToString()`** — call on every Prisma result before returning from service. Recursively converts BigInt fields to string.

---

## Known Issues & Work Plan

See the active task list in the Claude Code todo system. Issues are tracked as:
- `[SEC-N]` — security vulnerabilities
- `[BUG-N]` — business logic bugs
- `[PERF-N]` — performance issues
- `[ARCH-N]` — architectural problems
- `[REFACTOR-N]` — code quality

### Security (critical — fix first)
- **SEC-1** `services` module has no company isolation — any user can read/modify all services globally
- **SEC-2** `vehicle-history` module has no company isolation — `findAll` returns all records across all companies
- **SEC-3** ✅ FIXED — `tasks.update` allowed reassigning `vehicle_id` to any vehicle without ownership check
- **SEC-4** ✅ FIXED — `invoice.generate` had `if (client.company_id && ...)` which passed when `company_id` is null
- **SEC-5** `ensureStorageAccess` only checks storage exists, not that it belongs to the requesting company
- **SEC-6** Apollo Sandbox + introspection enabled in production by default

### Business Logic Bugs
- **BUG-1** `vehicle_number` uniqueness is global across all companies — should be per-company
- **BUG-2** Two different `normalizePhone` implementations (`client.service.ts` vs `xlsx-processor.service.ts`)

### Performance
- **PERF-1** Double DB queries in `vehicle.service.ts` — `create`/`update`/`archive` do a redundant `findUnique` after the operation
- **PERF-2** N+1 in `InvitationResolver` — fetches company per invitation individually
- **PERF-3** Unbounded queries: `findAllMakes`, `findAllModels`, `findCompanyMembers` load full tables
- **PERF-4** XLSX import runs a separate transaction per row — should batch

### Architecture
- **ARCH-1** In-memory PDF cache (`Map` on service instance) doesn't work in serverless (Vercel)

### Refactoring
- **REFACTOR-1** `findAndFilter` and `filteredVehicles` in `vehicle.service.ts` are near-duplicates
- **REFACTOR-2** `generate()` and `rebuildPdfBuffer()` in `invoice.service.ts` have ~80 duplicate lines
- **REFACTOR-3** Run `npx prisma generate` and remove `as any` casts in `invoice.service.ts` and `xlsx-processor.service.ts`
- **REFACTOR-4** Replace raw `throw new Error()` with proper NestJS exceptions across all services

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | Prisma connection (pooled) |
| `DIRECT_DATABASE_URL` | ✅ | Direct connection for migrations |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Admin Supabase operations |
| `SUPABASE_JWT_SECRET` | optional | Local JWT validation (faster auth) |
| `NOVA_POSHTA_API_KEY` | ✅ | Nova Poshta address API |
| `ALLOWED_ORIGINS` | optional | CORS whitelist |
| `PORT` | optional | Server port (default 3000) |
| `ENABLE_APOLLO_SANDBOX` | optional | `false` to disable in production |

---

## Useful Commands

```bash
npm run start:dev          # dev server with watch
npm run build              # prisma generate + nest build
npx prisma generate        # regenerate Prisma client after schema changes
npx prisma migrate dev     # run pending migrations (dev)
npm run lint               # ESLint with auto-fix
```

---

## Notes for Claude

- **Always check `company_id`** on every mutation/query that touches company-scoped data.
- **Never use raw `throw new Error()`** — use NestJS exceptions.
- **`services` table has no `company_id`** — this is a known design issue (SEC-1). Services are currently a global shared catalog.
- **`vehicle_number` is globally unique** in the DB schema — this is a known bug (BUG-1) waiting for a migration.
- **Prisma types for `invoices` and `reports`** may need `as any` until `prisma generate` is run locally.
- The worktree at `.claude/worktrees/reverent-hawking-289a64` contains partial SEC-3 and SEC-4 fixes — those should be applied to `main` directly.
