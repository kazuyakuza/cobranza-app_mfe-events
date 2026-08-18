# Simplification Plan — Task 1: reflect-metadata docs

## 1. README.md — Runtime Setup

Replace the full `angular.json` and test-setup snippets in `README.md` with a short overview and cross-links to the dedicated guides.

**Current:** ~42 lines repeating instructions that already live in `docs/examples/` and `docs/troubleshooting.md`.

**Suggested replacement:**

```markdown
## Runtime Setup

`@cobranza-apps/mfe-events` uses `class-validator` decorators internally. The library does **not** bundle `reflect-metadata`; load it before the first call to any creator / dispatcher / assert helper. The correct strategy depends on your environment:

- **Angular (esbuild / Vite / Native Federation):** add `reflect-metadata/Reflect.js` to `angular.json` `scripts`. Do **not** `import 'reflect-metadata'` in `src/main.ts`.
- **Node.js / Vitest / Jest:** `import 'reflect-metadata'` in your test setup file.

See copy-paste examples in [`docs/examples/`](docs/examples/) and common errors in [`docs/troubleshooting.md`](docs/troubleshooting.md).
```

Remove the `### Why Two Different Ways?` subsection; the explanation moves to `docs/troubleshooting.md` and the example files.

## 2. README.md — Quick Usage consistency

Align the README dispatch snippet with `docs/USAGE.md` pattern A by using `dispatchMfeEvent`.

**Current snippet:**

```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  createMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = { ... };

window.dispatchEvent(createMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail));
```

**Suggested snippet:**

```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = { ... };

dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail);
```

This reduces boilerplate and keeps the README example consistent with the usage guide.

## 3. USAGE.md — Heading levels

Change main content headings from `###` to `##` for a conventional outline (title `#`, sections `##`).

**Affected headings:**

- `### 2.1 Overview` → `## 2.1 Overview`
- `### 2.2 Core rules (must follow)` → `## 2.2 Core rules (must follow)`
- `### 2.3 Event catalog` → `## 2.3 Event catalog`
- `### 2.4 Payload reference` → `## 2.4 Payload reference`
- `### 2.5 Helpers` → `## 2.5 Helpers`
- `### 2.6 Copy-paste patterns` → `## 2.6 Copy-paste patterns`
- `### 2.7 Multi-instance guidance` → `## 2.7 Multi-instance guidance`
- `### 2.8 Relationship to @cobranza-apps/ui` → `## 2.8 Relationship to @cobranza-apps/ui`

Anchor links in the Table of Contents remain valid (`#21-overview`, etc.).

## 4. USAGE.md — §2.5 reflect-metadata helper bullet

Replace the long, duplicated `reflect-metadata` explanation (lines 139–154) with a concise cross-link.

**Suggested replacement:**

```markdown
- **`reflect-metadata` requirement** — the library uses `class-validator` decorators and does **not** import the polyfill itself. Load it before the first call to any creator / dispatcher / assert helper. Strategy is environment-dependent; see [README §Runtime Setup](../README.md#runtime-setup) and the copy-paste examples in [`examples/`](examples/).
```

This removes duplicated JSON/TS snippets that already exist in `README.md` and `docs/examples/`.

## 5. USAGE.md — §2.6 pattern G2 drag-state guidance

The drag-state code block and the following `**Key points for AI agents:**` bullets repeat the same information. Simplify by keeping the code block with concise comments and removing the redundant bullet list.

**Remove:**

```markdown
**Key points for AI agents:**

- `dragState` and `previewMode` are **optional** fields.
- When both are omitted, the module is at rest (normal state).
- `dragState` follows a lifecycle: `'drag-start'` → `'drag-end'` → `'dropped'`.
- `previewMode: 'collapsed'` is typically sent alongside `dragState: 'drag-start'` or `'drag-end'`.
- Always check `event.detail.instanceId` to ensure the event is for your instance.
```

Keep the code block; its comments already cover these points. Optionally tighten the code comments if needed.

## 6. src/create-event.ts — JSDoc duplication

Shorten the file-level and function-level JSDoc blocks. They repeat the full reflect-metadata loading instructions already documented in README/USAGE/examples.

**Suggested file-level block:**

```ts
/**
 * @file Core event creators with runtime payload validation.
 *
 * Exports {@link createMfeEvent} and {@link createShellEvent}. Consumers must
 * load `reflect-metadata` before the first call. The library does not import it,
 * to avoid forcing a global side effect. Loading strategy is environment-
 * dependent; see README §Runtime Setup and docs/examples/.
 *
 * @see {@link file://./validate-payload.ts}
 * @see {@link file://./dispatch.ts}
 */
```

**Suggested function-level runtime note** (replace the `**Runtime requirement:**` paragraph in both `createMfeEvent` and `createShellEvent`):

```markdown
 * @remarks Load `reflect-metadata` before calling; see README §Runtime Setup.
```

## 7. package.json — redundant peer dependency metadata

Remove the `peerDependenciesMeta` block. `reflect-metadata` is already listed in `peerDependencies`, and `optional: false` is the default behavior.

**Remove:**

```json
  "peerDependenciesMeta": {
    "reflect-metadata": {
      "optional": false
    }
  },
```

## 8. .agent/project-structure.md — formatting consistency

Make the `docs/` entry consistent with the other list items.

**Current:**

```markdown
- docs/: Documentation files
```

**Suggested:**

```markdown
- docs/ - Documentation files
```

## 9. docs/examples/*.md — optional "Why this works" paragraphs

The three example files each contain a short "Why this works" paragraph with nearly identical wording. Because they are standalone consumer guides, keep the brief explanation, but optionally condense each to one sentence plus a link to `README §Runtime Setup`. **Not strongly recommended** if the guides are meant to be copy-paste independent.

## Summary of main wins

- Remove duplicated reflect-metadata loading instructions across `README.md`, `docs/USAGE.md`, and `src/create-event.ts` JSDoc.
- Make `README.md` Quick Usage consistent with `docs/USAGE.md` by using `dispatchMfeEvent`.
- Remove redundant `peerDependenciesMeta` block from `package.json`.
- Clean up heading levels in `docs/USAGE.md` and minor formatting in `.agent/project-structure.md`.
