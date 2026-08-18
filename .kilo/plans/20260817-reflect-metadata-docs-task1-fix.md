# Fix & Simplification Plan — Task 1: reflect-metadata docs

## Fixes (from Code Review)

### 1. `docs/troubleshooting.md` — stray backtick breaks table rendering

**File:** `docs/troubleshooting.md`
**Issue:** Line 11 has a stray backtick after `decorator` that corrupts the Markdown table row.

**Current:**
```markdown
| `class-validator` / `class-transformer` errors in unit tests (`Validation failed`, `isClassValidator` not a decorator`, empty `errors[]`) | `reflect-metadata` not loaded in the test environment. | Add `reflect-metadata` to the test runner's `setupFiles`. See [examples/vitest-setup.md](examples/vitest-setup.md) / [examples/jest-setup.md](examples/jest-setup.md). |
```

**Fix:**
```markdown
| `class-validator` / `class-transformer` errors in unit tests (`Validation failed`, `isClassValidator` not a decorator, empty `errors[]`) | `reflect-metadata` not loaded in the test environment. | Add `reflect-metadata` to the test runner's `setupFiles`. See [examples/vitest-setup.md](examples/vitest-setup.md) / [examples/jest-setup.md](examples/jest-setup.md). |
```

Commit: `docs(troubleshooting): fix stray backtick in error table`

---

## Simplifications (selected, non-conflicting with TODO)

### 2. `README.md` — Quick Usage snippet consistency

Align the README Quick Usage MFE dispatch snippet with `docs/USAGE.md` pattern A by using `dispatchMfeEvent` instead of `createMfeEvent` + `window.dispatchEvent`.

**Current snippet (lines 43–62):**
```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  createMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
  schemaVersion: SCHEMA_VERSION,
};

window.dispatchEvent(createMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail));
```

**Replace with:**
```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail);
```

Commit: `docs(readme): align Quick Usage snippet with USAGE.md dispatch pattern`

### 3. `.agent/project-structure.md` — formatting consistency

Make the `docs/` entry consistent with other list items (use `-` not `:` after path).

**Current:**
```markdown
- docs/: Documentation files
```

**Replace with:**
```markdown
- docs/ - Documentation files
```

Commit: `docs(project-structure): normalize docs/ entry formatting`

---

## Simplifications SKIPPED (conflict with TODO explicit requirements)

The following simplifications from `20260817-reflect-metadata-docs-task1-simplify.md` are **NOT applied** because they contradict the explicit wording/structure requested in `.agent/todos/20260817/20260817-todo-0.md`:

1. **README.md Runtime Setup shortening** — TODO explicitly requested the full `angular.json` snippet, `### Why Two Different Ways?`, and the test-setup snippet in README.
2. **USAGE.md heading level promotion (`###` → `##`)** — Not requested in TODO; may break existing conventions and anchor links.
3. **USAGE.md §2.5 condensing to cross-link** — TODO explicitly provided the dual-path block with snippets for this section.
4. **USAGE.md §2.6 G2 bullet removal** — Not related to this task's scope; existing content is acceptable.
5. **`src/create-event.ts` JSDoc shortening** — TODO explicitly provided the longer JSDoc text for `create-event.d.ts` (generated from `.ts`).
6. **`package.json` removal of `peerDependenciesMeta`** — TODO Task 2 explicitly requests `peerDependenciesMeta` with `optional: false`.
