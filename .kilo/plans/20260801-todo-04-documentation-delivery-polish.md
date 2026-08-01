# Global Plan — TODO 04: Documentation (README + USAGE.md) & Delivery Polish

**TODO file:** `.agent/todos/20260801/20260801-todo-1.md`  
**Date:** 2026-08-01

---

## Global Pre-Analysis

The `@cobranza-apps/mfe-events` library (v0.3.0) already has:
- Fully implemented event constants, payload types, helpers, and validation.
- An extensive README.md (182 lines) with event catalog, quick usage, design principles, and AI-agent onboarding.
- Comprehensive JSDoc on virtually every public export.

What is missing for "delivery polish":
1. `docs/USAGE.md` is a 3-line stub. The TODO mandates a full usage guide with overview, core rules, event catalog tables, payload reference, helpers reference, copy-paste snippets (A–H), multi-instance guidance, and relationship to `@cobranza-apps/ui`.
2. No anti-patterns document exists. The TODO mandates `docs/anti-patterns.md` covering 6 specific anti-patterns.
3. Minor JSDoc drift exists (vestigial "TODO 03" references, missing `@example` on `assertMfePayload` / `assertShellPayload`).

All three TODO tasks are documentation-only, interdependent (USAGE.md cross-links to anti-patterns, JSDoc must match USAGE examples), and non-front-end. They are joined into a single 4.1–4.6 cycle.

---

## Per-Task Pre-Analysis

### Combined Task: Docs & Delivery Polish

- **Front-end related:** No. This is a TypeScript library documentation task; no UI components, CSS, or browser rendering work.
- **Technical decisions:**
  - USAGE.md should remain under `docs/` (already referenced by README).
  - Anti-patterns doc should live under `docs/` for consistency.
  - README.md only needs cross-link updates (no structural rewrite).
  - JSDoc fixes are surgical: remove vestigial TODO references, add two `@example` blocks, ensure "emitted by / listened by" phrasing on events/payloads.
  - All code snippets in docs must use real exports from `src/public-api.ts` and real event/payload names.
  - `SCHEMA_VERSION` is `1`; all examples must include it.
  - `reflect-metadata` requirement must be mentioned in USAGE.md helpers section.

---

## Execution Steps

### Step 2: Git Feature Branch Setup
- **Agent:** implementer
- **Branch name:** `feat/todo-04-docs-delivery-polish`
- Ensure `main` is clean, create and switch to feature branch.

### Step 3: Version Update
- **Agent:** implementer
- Bump `package.json` version: `0.3.0` → `0.3.1` (patch — docs polish, no functional change).
- Commit: `chore: bump version to 0.3.1`

### Task 1: Docs & Delivery Polish

#### 4.1b Analysis & Planning
- **Agent:** architector
- Read TODO file, README.md, existing JSDoc, and all public exports.
- Produce detailed implementation plan: exact USAGE.md sections with snippet templates, anti-patterns doc outline, JSDoc delta list.
- Save plan to `.kilo/plans/20260801-todo-04-docs-delivery-polish-task.md`.
- Present to user for approval.

#### 4.2 Implementation
- **Agent:** implementer
- **Scope:**
  1. Write `docs/USAGE.md` covering all TODO sections 2.1–2.8 with copy-paste snippets A–H.
  2. Create `docs/anti-patterns.md` with 6 anti-patterns and cross-links.
  3. Update `README.md`: refresh cross-links to USAGE.md and anti-patterns doc; verify no invented APIs.
  4. JSDoc surgical fixes:
     - `src/types.ts`: remove "TODO 03" vestigial references in `MfeEventMap` / `ShellEventMap` JSDoc.
     - `src/events.ts`: tighten module-level JSDoc if it contains forward-looking TODO language.
     - `src/assert.ts`: add `@example` blocks to `assertMfePayload` and `assertShellPayload`.
     - Spot-check all public exports for "emitted by / listened by" phrasing; add where missing.
- Commit with meaningful messages per section.

#### 4.3 Code Review & Simplification
- **Agents:** code-reviewer + code-simplifier (concurrent)
- Review docs for:
  - Accuracy against real exports (no invented APIs, correct payload fields, correct event names).
  - Consistency with README and JSDoc.
  - Grammar, clarity, and AI-agent readability.
- Simplify prose where redundant or overly verbose.
- Produce fix/simplification plan; save in `.kilo/plans/20260801-todo-04-docs-delivery-polish-task.md`.
- Plan Agent assigns fix/simplification to implementer.

#### 4.4 Documentation
- **Agent:** docs-specialist
- Final documentation pass:
  - Ensure `docs/USAGE.md` has a Table of Contents if it exceeds 100 lines.
  - Ensure `docs/anti-patterns.md` is cross-linked from README and USAGE.md.
  - Verify all JSDoc comments are consistent with written docs.
  - Add any missing high-level module JSDoc.

#### 4.5b Overall Plan Adherence
- **Agent:** architector
- Verify implementation against TODO requirements:
  - All 3 tasks in TODO are addressed.
  - Every copy-paste snippet (A–H) is present and valid.
  - Anti-patterns doc covers all 6 items.
  - JSDoc pass completed.
- Report any deviations.

#### 4.6 Task Completion
- **Agent:** implementer
- In `.agent/todos/20260801/20260801-todo-1.md`:
  - Append `[DONE]` to each `###` task heading (1, 2, 3).
  - Convert all `- [ ]` sub-items under each task to `- [x]`.
- Preserve all original content.
- Commit: `docs: mark TODO 04 tasks as done`

### Step 5: TODO File Completion
- **Agent:** implementer
- Rename `.agent/todos/20260801/20260801-todo-1.md` → `.agent/todos/20260801/20260801-todo-1-DONE.md`.
- Ensure all commits are on the feature branch.
- Merge `feat/todo-04-docs-delivery-polish` into `main`.
- Delete feature branch on successful merge.
- Push `main` to `origin` only.

---

## Constraints

- Do not invent APIs not present in `src/public-api.ts`.
- Docs are in English.
- No new events, payloads, or helpers unless a documentation gap forces a tiny fix (unlikely; code is complete).
- No secondary entry points, publishing, demo apps, or Spanish translation.
