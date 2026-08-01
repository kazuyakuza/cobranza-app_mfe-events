# Global Plan: Initialize Project Info & Update README

**TODO File:** `.agent/todos/20260631/20260631-todo-0.md`
**Date:** 2026-07-31

## Overview

This global plan covers two project-setup tasks for `@cobranza-apps/mfe-events`:
1. Initialize the remaining core project-info files (product.md, context.md, architecture.md, tech.md) and remove the `.initialized` marker.
2. Update the README from the base-project template to a project-specific README for the MFE events library.

## Pre-Analysis

- **Project:** `@cobranza-apps/mfe-events` — a purely typed TypeScript library defining communication contracts between a Back-office Shell and Micro-frontends.
- **Current State:**
  - `brief.md` is fully defined with detailed event catalog, payloads, helpers, and design principles.
  - `.agent/project-info/.initialized` still exists (base-project marker).
  - Missing core project-info files: `product.md`, `context.md`, `architecture.md`, `tech.md`.
  - README is the generic base-project template.
  - `src/` is empty; no `package.json` yet.
- **Front-end Related:** No. Both tasks are documentation/project-setup only.
- **Technical Decisions:**
  - Project-info files should be derived from `brief.md` and existing project context.
  - README should follow the structure of `brief.md` sections 1–4 and 9, plus standard project README elements (install, usage, development).

## Steps

### Shared Setup
- **Step 2:** Git Feature Branch Setup → implementer
- **Step 3:** Version Update → implementer (no package.json; skip with note)

### Task 1: Initialize Project Info
- **Task 1 — 4.1b:** Analysis & Planning (project-info file structure, content mapping from brief) → architector
- **Task 1 — 4.2:** Implementation (create product.md, context.md, architecture.md, tech.md; remove .initialized) → implementer
- **Task 1 — 4.3:** Code Review & Simplification (verify file accuracy, consistency with brief) → code-reviewer & code-simplifier; fixes → implementer
- **Task 1 — 4.4:** Documentation (ensure cross-links, JSDoc style comments if needed) → docs-specialist
- **Task 1 — 4.5b:** Overall Plan Adherence (verify all 4 core files created, .initialized removed) → architector
- **Task 1 — 4.6:** Task Completion (mark task done in TODO) → implementer

### Task 2: Update README File
- **Task 2 — 4.1b:** Analysis & Planning (README structure, sections, tech stack summary) → architector
- **Task 2 — 4.2:** Implementation (rewrite README.md with project-specific content) → implementer
- **Task 2 — 4.3:** Code Review & Simplification (verify completeness, clarity, links) → code-reviewer & code-simplifier; fixes → implementer
- **Task 2 — 4.4:** Documentation (ensure README links to project-info, USAGE patterns) → docs-specialist
- **Task 2 — 4.5b:** Overall Plan Adherence (verify README matches project scope) → architector
- **Task 2 — 4.6:** Task Completion (mark task done in TODO) → implementer

### Finalization
- **Step 5:** TODO File Completion (rename with -DONE suffix, merge branch) → implementer
