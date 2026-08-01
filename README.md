# @cobranza-apps/mfe-events

TypeScript contract library for Shell–MFE communication.

## Purpose

- Named event constants: `MFE_EVENTS`, `SHELL_EVENTS` with stable `mfe:` / `shell:` prefixes.
- Strongly typed payload interfaces and `EventMap` types for type-safe dispatch and listen.
- Thin type-level + runtime helpers for the browser `CustomEvent` / `window` APIs: `createMfeEvent`, `createShellEvent`, `isMfeEvent`, `isShellEvent`.
- JSDoc + copy-paste usage examples on every public export.
- Does NOT contain: business logic, Angular components/services/DI, RxJS, an event bus, BFF/API communication, UI chrome (owned by `@cobranza-apps/ui`), or DOM manipulation by MFEs outside their own container.
- Core rule: MFEs dispatch `mfe:*`; only the Shell listens. The Shell may push info to MFEs via Angular Inputs and/or `shell:*` events.

## Installation

> Package manager and registry are not yet finalized (see `.agent/project-info/tech.md`). Once published, install with the adopted manager:

```bash
# npm
npm install @cobranza-apps/mfe-events

# pnpm
pnpm add @cobranza-apps/mfe-events
```

No Angular peer dependency is required. TypeScript 5.x and a modern browser `CustomEvent`/`window` API are the only runtime expectations.

## Quick Usage

**MFE dispatch (from the MFE side):**

```ts
import {
  MFE_EVENTS,
  createMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
};

window.dispatchEvent(createMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail));
```

**Shell listen (from the Shell side):**

```ts
import { MFE_EVENTS, isMfeEvent } from '@cobranza-apps/mfe-events';

window.addEventListener(MFE_EVENTS.REQUEST_FULLSCREEN, (event: Event) => {
  if (!isMfeEvent(event, MFE_EVENTS.REQUEST_FULLSCREEN)) return;
  const { moduleType, instanceId } = event.detail;
  // Shell navigates to fullscreen for this instance
});
```

Full examples (Shell→MFE broadcast + filter, multi-instance handling) live in [docs/USAGE.md](docs/USAGE.md).

## Event Catalog

### MFE -> Shell

| Constant | Event name | Purpose |
| --- | --- | --- |
| `REQUEST_ADD_MODULE` | `mfe:request-add-module` | Ask the Shell to add a new module instance to the workbench |
| `REQUEST_FULLSCREEN` | `mfe:request-fullscreen` | Ask the Shell to switch this instance to fullscreen |
| `REQUEST_REMOVE` | `mfe:request-remove` | Ask the Shell to remove this instance from the workbench |
| `UPDATE_HEADER` | `mfe:update-header` | MFE updates its own header chrome (title, status) |
| `SHOW_NOTIFICATION` | `mfe:show-notification` | Ask the Shell to show a global toast/notification |
| `MODULE_READY` | `mfe:module-ready` | MFE finished mounting and is ready |
| `MODULE_ERROR` | `mfe:module-error` | Unrecoverable load/init error for this instance |

### Shell -> MFE

| Constant | Event name | Purpose |
| --- | --- | --- |
| `MODULE_STATE` | `shell:module-state` | Notify size / collapse / fullscreen / pixel dimensions for this instance |
| `THEME_CHANGED` | `shell:theme-changed` | Theme token set changed |
| `VISIBILITY_CHANGED` | `shell:visibility-changed` | Instance became visible or hidden |

### Naming rules

- MFE → Shell: prefix `mfe:`; Shell → MFE: prefix `shell:`.
- kebab-case after the prefix.
- No company/domain segment, no version suffix in the name.

### Deferred (not in v1)

- `WORKSPACE_CONTEXT` (sibling instances list)
- Auth / session / token events
- Domain-specific events (`mfe:client:*`, etc.)
- Notification actions (button that fires another event)

## Design Principles

- **Typed first.** Every event has a typed payload; no `detail: any`.
- **Serializable only.** Payloads are plain JSON-serializable data (no functions, DOM nodes, class instances).
- **Stable names.** Event name strings never change for a given meaning; evolve via optional new fields + package major version.
- **Many focused events** over a few overloaded ones that keep growing props.
- **Shell is the only listener of `mfe:*` events.** MFEs do not listen to each other.
- **Broadcast + filter.** `shell:*` events are dispatched on `window`; each MFE instance filters by `instanceId` (and usually `moduleType`).
- **Multi-instance aware.** The same `moduleType` can appear multiple times; almost every payload carries `moduleType` + `instanceId`.

## Tech Stack

| Item | Choice | Notes |
| --- | --- | --- |
| Language | TypeScript 5.x | Angular 22 ecosystem |
| Module format | ESM + typings | publishable package |
| Angular | Not a dependency | types + thin helpers only |
| Runtime | Browser `CustomEvent` + `window` | no Node runtime at consumer side |
| Node | 22.22.3 (`.nvmrc`) | dev toolchain |
| Build | TBD (`tsup` / `unbuild` / `tsc` + `api-extractor`) | no Angular compiler needed |
| Testing | Vitest or Jest (helpers) + `tsc --noEmit` (types) | no browser/E2E |
| Docs | JSDoc + README + `docs/USAGE.md` | no Storybook |

Build tool and package manager are `[FLAGGED]` (decided at initial implementation; see `.agent/project-info/tech.md`).

## Documentation

- [Quick Usage](#quick-usage) (above) — minimal dispatch + listen.
- Full copy-paste examples (Shell→MFE broadcast, filtering, multi-instance) are in [docs/USAGE.md](docs/USAGE.md) (authored in a follow-up task).
- JSDoc on every public export (event constants, payload interfaces, type maps, helpers).
- Project knowledge base: [`.agent/project-info/`](.agent/project-info/) (`brief.md`, `product.md`, `tech.md`, `architecture.md`, `context.md`).

## Development & Contributing (for AI Agents)

This repo is maintained AI-agent-first via the Kilo Code critical workflow.

- **Before any change**, read and follow [`AGENTS.md`](AGENTS.md) — primary source of agent instructions.
- Follow the Critical Workflow in [`.kilo/commands/critical-workflow.md`](.kilo/commands/critical-workflow.md) (TODO → branch → plan → implement → review → docs → verify → merge).
- Project rules live in [`.kilo/rules/`](.kilo/rules/): max 2 args per method, max depth 2, private-by-default, self-documenting code, no commented code, strict typing (no `detail: any`).
- Source code goes in `src/` per [`.agent/project-structure.md`](.agent/project-structure.md).
- Plans are stored in [`.kilo/plans/`](.kilo/plans/).
- To start a task, open a TODO file under `.agent/todos/<YYYYMMDD>/` and run `/critical-workflow`.
- Branch model: `feat/<name>` (features) / `fix/<name>` (fixes) off `main`; merge back at end of the workflow.

## Related Packages

| Package | Relationship |
| --- | --- |
| `@cobranza-apps/ui` | Owns `ModuleHeader`/`ModuleContainer` visuals and the `ModuleStatus` union (keep values in sync). Does NOT dispatch these events. |
| `@cobranza-apps/entities` | Domain models. Not imported by `mfe-events`; payloads stay generic. |
| Shell | Sole `mfe:*` listener; owns workbench state, fullscreen URL, notification host. |
| Individual MFEs | Dispatch `mfe:*`; filter `shell:*` by `instanceId`. |

<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: it is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
