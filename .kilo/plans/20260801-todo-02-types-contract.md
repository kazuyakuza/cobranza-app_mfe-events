# Global Plan — TODO 02: Shared Types, Event Constants, Payloads & Event Maps

**Source:** `.agent/todos/20260631/20260631-todo-2.md`  
**Date:** 2026-08-01

---

## Pre-analysis

This is a **pure TypeScript types-and-constants task** (no runtime helpers, no UI, no front-end framework). The project scaffolding from TODO-01 is already in place: `package.json`, `tsconfig.json`, placeholder files under `src/`, and a working `tsc` build. The goal is to fill the type-level contract exactly as specified in `docs/mfe-events-project-brief.md` §5–6.

**Key technical decisions:**
- Use plain `tsc` build (already configured); no new dependencies needed.
- Keep `instanceId` as `string` (documented as UUID) — no new UUID package.
- Payloads are **interfaces only**; `class-validator`/`class-transformer` deferred to a later TODO.
- Circular import avoidance: `events.ts` → no deps; `payloads.ts` → imports primitives from `types.ts`; `types.ts` → imports events constants and payloads for the maps. No cycle because `events.ts` has zero imports.

---

## Task-level plan (single task — TODO 02)

| Step | Sub-agent | Description |
|------|-----------|-------------|
| **2** | implementer | Git feature branch setup (`feat/todo-02-types-contract`) |
| **3** | implementer | Version bump (`0.1.0` → `0.2.0`) — minor, because this adds the public API surface |
| **4.1** | architector | Analysis & planning: confirm payload shapes, JSDoc strategy, import graph, file layout |
| **4.2** | implementer | Implementation: fill `types.ts`, `events.ts`, `payloads.ts`, update `index.ts` re-exports, ensure `npm run typecheck` passes |
| **4.3** | code-reviewer + code-simplifier | Review for correctness vs brief, check JSDoc coverage, simplify where possible |
| **4.3-fix** | implementer | Apply review fixes |
| **4.4** | docs-specialist | Ensure JSDoc is complete on every public export; update README if needed |
| **4.5** | architector | Verify plan adherence: compare files to TODO checklist, confirm build passes |
| **4.6** | implementer | Mark task `[DONE]` in TODO file, commit |
| **5** | implementer | Merge feature branch to `main`, push to `origin` |

---

## Front-end related?

**No.** This is a TypeScript library with no UI components, CSS, HTML, or browser framework code. Steps 4.1a and 4.5a are **omitted**.

---

## Per-step context to pass

- **TODO path:** `.agent/todos/20260631/20260631-todo-2.md`
- **Brief path:** `.agent/project-info/brief.md`
- **Key constraint:** Do NOT add `createMfeEvent`, `isMfeEvent`, `dispatch*`, `class-validator`, or `class-transformer`.
- **Key constraint:** `helpers.ts` stays empty (placeholder).
- **Existing files to preserve:** `src/index.ts`, `src/public-api.ts` (only add re-exports, never remove existing structure).
