# @cobranza-apps/mfe-events — Project Brief

**Target consumers:** Company Back-office Shell + all Company Micro-frontends (MFEs)  
**Repo model:** Standalone library repository (this repository *is* the library; not a monorepo)

## 1. Purpose

`@cobranza-apps/mfe-events` is a **purely typed TypeScript library** that defines the communication contracts between the Company Back-office **Shell** and its **Micro-frontends**.

It provides:

- Named event constants (with stable `mfe:` / `shell:` prefixes)
- Strongly typed payload interfaces
- An `EventMap` for type-safe dispatch and listen
- Small type-level and runtime helpers for creating and narrowing CustomEvents
- Documentation written so both humans and AI agents can consume the API correctly

It does **not** contain:

- Business logic or domain rules
- Workspace layout, drag-and-drop, or persistence
- BFF / API communication
- Angular components, services, or DI
- Theme or UI chrome (owned by `@cobranza-apps/ui` - already published)
- Runtime event bus beyond thin helpers around the browser `CustomEvent` / `window` APIs

**Core rule:** MFEs never manipulate the DOM outside their own container. All communication toward the Shell goes through these typed events. The Shell may push information to MFEs via Angular Inputs and/or the Shell→MFE events defined here.

## 2. Scope

### 2.1 In scope (v1)

| Category | Items |
| ---------- | ------- |
| **Event constants** | `MFE_EVENTS`, `SHELL_EVENTS` |
| **Payload interfaces** | One interface per event (see §5) |
| **Type maps** | `MfeEventMap`, `ShellEventMap`, combined helpers |
| **Helpers** | Typed `createMfeEvent` / `createShellEvent`, type guards, optional typed listener helpers |
| **Shared types** | `ModuleStatus`, `ModuleSize`, `ModuleIdentity`, etc. |
| **Documentation** | README + USAGE oriented to AI agents + JSDoc on every export |

### 2.2 Out of scope

- Any Angular runtime (no components, no services, no NgModules)
- Event versioning inside the event name string (use payload `schemaVersion` + semver of the package instead)
- Domain-specific events (`mfe:client:*`, etc.) — keep events generic; domain data goes inside payloads
- Inter-MFE direct communication (forbidden; go through Shell or BFF)
- Auth / token distribution (handled via BFF + storage / Inputs)
- `WORKSPACE_CONTEXT` broadcast (deferred; not in v1)
- Mobile / responsive concerns (desktop-only product; irrelevant to this lib)
- Client Portal (End User) — this library is for the Company Back-office only (99% certainty)

### 2.3 Design principles

- **Typed first.** Every event has a payload type. No untyped `detail: any`.
- **Serializable only.** Payloads must be plain JSON-serializable data. No functions, no DOM nodes, no class instances, no component references.
- **Stable names.** Event name strings never change for a given meaning. Evolve via new fields (optional) or package major version.
- **Prefer many focused events** over a few overloaded ones that keep growing props.
- **Shell is the only listener of `mfe:*` events.** MFEs do not listen to each other.
- **Broadcast + filter.** Shell→MFE events are dispatched on `window`; each MFE instance filters by `instanceId` (and usually `moduleType`).
- **Multi-instance aware.** The same remote (`moduleType`) can appear multiple times in the workspace. Almost every payload carries `moduleType` + `instanceId`.
- **AI-agent friendly docs.** Every public export has clear JSDoc; USAGE.md shows copy-paste examples from both sides (MFE and Shell).

## 3. Technical Stack

| Item | Choice | Notes |
| ------ | -------- | ------- |
| Language | TypeScript | Align with Angular 22 ecosystem |
| Angular | **Not a dependency** | This is a types + thin helpers library |
| Module format | ESM + typings | Standard for a publishable TS package |
| Build | `tsup` or `unbuild` or plain `tsc` + `api-extractor` style | Prefer simple, no Angular compiler needed |
| Package manager | Whatever the repo already uses (npm/pnpm) | Keep consistent with other `@cobranza-apps/*` libs |
| Testing | Vitest or Jest (unit) for helpers / type tests if useful | Types can be checked with `tsc --noEmit` |
| Documentation | JSDoc + README.md + USAGE.md | No Storybook |
| Validations | class-transform & class-validator when/where required | |

**Peer / runtime expectations for consumers:**

- Modern browser with `CustomEvent` and `window.dispatchEvent` / `addEventListener`
- TypeScript 5.x (same major as used by Angular 22 projects)
- No Angular peer dependency required by this package

**Package name (exact):**

```json
"@cobranza-apps/mfe-events"
```

## 4. Library Structure (Proposal)

```text
mfe-events/
├── src/
│   ├── events.ts          # MFE_EVENTS, SHELL_EVENTS constants
│   ├── payloads.ts        # all payload interfaces
│   ├── types.ts           # ModuleStatus, ModuleSize, ModuleIdentity, EventMaps, etc.
│   ├── helpers.ts         # createMfeEvent, createShellEvent, type guards, listeners
│   ├── index.ts           # re-exports (internal barrel)
│   └── public-api.ts      # single public entry (or split — see §8)
├── docs/
│   ├── ...
│   └── USAGE.md
├── package.json
├── tsconfig.json
├── README.md
└── ...
```

**Preferred public surface:**

- Main entry: `@cobranza-apps/mfe-events` → everything
- Optional secondary entries:  
  `@cobranza-apps/mfe-events/events`,  
  `@cobranza-apps/mfe-events/payloads`,  
  `@cobranza-apps/mfe-events/types`,  
  `@cobranza-apps/mfe-events/helpers`  

If secondary entries add complexity, a **single** public entry that re-exports everything is acceptable for v1.

## 5. Initial Event Catalog

### 5.1 Naming rules

- MFE → Shell: prefix `mfe:`
- Shell → MFE: prefix `shell:`
- Use kebab-case after the prefix
- No company/domain segment in the name (`mfe:open-detail`, not `mfe:company:open-detail`)
- No version suffix in the name (`mfe:update-header`, not `mfe:update-header.v2`)

### 5.2 MFE → Shell events

| Constant | Event name string | Purpose |
| ---------- | ------------------- | --------- |
| `REQUEST_ADD_MODULE` | `mfe:request-add-module` | Ask the Shell to add a new module instance to the workbench (e.g. footer “+” or cross-module navigation) |
| `REQUEST_FULLSCREEN` | `mfe:request-fullscreen` | Ask the Shell to switch **this** instance to fullscreen (Shell owns URL change and replaces workbench content) |
| `REQUEST_REMOVE` | `mfe:request-remove` | Ask the Shell to remove **this** instance from the workbench |
| `UPDATE_HEADER` | `mfe:update-header` | MFE updates its own header chrome data (title, status). Shell may still control which action buttons are visible. |
| `SHOW_NOTIFICATION` | `mfe:show-notification` | Ask the Shell to show a global toast/notification (Shell hosts the notification UI; may use ng-bootstrap or a future `cba-toast`) |
| `MODULE_READY` | `mfe:module-ready` | MFE finished mounting and is ready (Shell can hide skeleton, register instance, etc.) |
| `MODULE_ERROR` | `mfe:module-error` | Unrecoverable load/init error for this instance |

### 5.3 Shell → MFE events

| Constant | Event name string | Purpose |
| ---------- | ------------------- | --------- |
| `MODULE_STATE` | `shell:module-state` | Notify size / collapse / fullscreen / pixel dimensions for **this** instance. Prefer one event over separate resize/collapse/fullscreen events. |
| `THEME_CHANGED` | `shell:theme-changed` | Theme token set changed (today only intermediate gray exists; contract is ready for future variants) |
| `VISIBILITY_CHANGED` | `shell:visibility-changed` | Instance became visible or hidden (fullscreen enter/exit, collapse, or workbench visibility) |

### 5.4 Explicitly deferred (not in v1)

- `WORKSPACE_CONTEXT` (list of sibling instances, etc.)
- Auth / session / token events
- Domain-specific events
- Notification actions (button that fires another event)

## 6. Proposed Shared Types & Payloads

### 6.1 Shared primitives

```ts
/** Status values aligned with @cobranza-apps/ui ModuleHeader */
export type ModuleStatus =
  | 'loading'
  | 'loaded'
  | 'success'
  | 'warning'
  | 'error'
  | 'dirty'
  | null;

/** Width fraction of a workbench row */
export type ModuleSize = '50%' | '100%';

/** Identity of a module instance in the workspace */
export interface ModuleIdentity {
  /** Remote / MFE kind, e.g. 'clients', 'debts', 'dashboard' */
  moduleType: string;
  /** Unique per instance; generated by the Shell when the module is added */
  instanceId: UUID; // => or string type, but generates an UUID.
}
```

Almost every payload **extends or embeds** `ModuleIdentity`.

Optional on payloads that may evolve:

```ts
schemaVersion: number; // throws error when omitted
```

### 6.2 MFE → Shell payloads

```ts
export interface RequestAddModulePayload {
  /** Which remote to add */
  moduleType: string;
  /** Optional initial title shown in the header */
  title?: string;
  /** Optional opaque data the new instance may read (filters, preselected id, etc.) */
  initialData?: Record<string, unknown>;
  schemaVersion: number;
}

export interface RequestFullscreenPayload extends ModuleIdentity {
  schemaVersion: number;
}

export interface RequestRemovePayload extends ModuleIdentity {
  schemaVersion: number;
}

export interface UpdateHeaderPayload extends ModuleIdentity {
  title?: string;
  status?: ModuleStatus;
  schemaVersion: number;
}

export interface ShowNotificationPayload {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  title?: string;
  /** Auto-dismiss in ms; Shell may apply a default if omitted */
  duration?: number;
  schemaVersion: number;
}

export interface ModuleReadyPayload extends ModuleIdentity {
  schemaVersion: number;
}

export interface ModuleErrorPayload extends ModuleIdentity {
  message: string;
  /** Optional machine-readable code */
  code?: string;
  schemaVersion: number;
}
```

### 6.3 Shell → MFE payloads

```ts
export interface ModuleStatePayload extends ModuleIdentity {
  size: ModuleSize;
  /** Actual CSS pixel width of the module container */
  width: number;
  /** Actual CSS pixel height of the module container */
  height: number;
  isCollapsed: boolean;
  isFullscreen: boolean;
  schemaVersion: number;
}

export interface ThemeChangedPayload {
  /** Theme identifier; currently only one value is expected */
  theme: 'gray-intermediate' | string;
  schemaVersion: number;
}

export interface VisibilityChangedPayload extends ModuleIdentity {
  visible: boolean;
  reason?: 'fullscreen' | 'collapse' | 'workbench' | string;
  schemaVersion: number;
}
```

### 6.4 Event maps (required)

```ts
export interface MfeEventMap {
  [MFE_EVENTS.REQUEST_ADD_MODULE]: RequestAddModulePayload;
  [MFE_EVENTS.REQUEST_FULLSCREEN]: RequestFullscreenPayload;
  [MFE_EVENTS.REQUEST_REMOVE]: RequestRemovePayload;
  [MFE_EVENTS.UPDATE_HEADER]: UpdateHeaderPayload;
  [MFE_EVENTS.SHOW_NOTIFICATION]: ShowNotificationPayload;
  [MFE_EVENTS.MODULE_READY]: ModuleReadyPayload;
  [MFE_EVENTS.MODULE_ERROR]: ModuleErrorPayload;
}

export interface ShellEventMap {
  [SHELL_EVENTS.MODULE_STATE]: ModuleStatePayload;
  [SHELL_EVENTS.THEME_CHANGED]: ThemeChangedPayload;
  [SHELL_EVENTS.VISIBILITY_CHANGED]: VisibilityChangedPayload;
}
```

## 7. Proposed Helpers (typed, minimal runtime)

Helpers must stay thin. Prefer pure functions that construct or narrow `CustomEvent`s.

Suggested API (exact names can be refined during implementation as long as behaviour matches):

```ts
/** Create a typed CustomEvent for an MFE → Shell message */
function createMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K]
): CustomEvent<MfeEventMap[K]>;

/** Create a typed CustomEvent for a Shell → MFE message */
function createShellEvent<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K]
): CustomEvent<ShellEventMap[K]>;

/** Type guard: is this Event a CustomEvent of the given MFE event type? */
function isMfeEvent<K extends keyof MfeEventMap>(
  event: Event,
  type: K
): event is CustomEvent<MfeEventMap[K]>;

/** Type guard for Shell events */
function isShellEvent<K extends keyof ShellEventMap>(
  event: Event,
  type: K
): event is CustomEvent<ShellEventMap[K]>;
```

Nice-to-have:

```ts
function dispatchMfeEvent<K extends keyof MfeEventMap>(
  type: K,
  detail: MfeEventMap[K],
  target?: EventTarget // default window
): void;

function dispatchShellEvent<K extends keyof ShellEventMap>(
  type: K,
  detail: ShellEventMap[K],
  target?: EventTarget
): void;
```

**Do not** introduce a full event-bus class, RxJS subjects, or Angular services inside this library.

## 8. Usage Patterns (must be documented in USAGE.md)

### 8.1 From an MFE (dispatch)

```ts
import {
  MFE_EVENTS,
  createMfeEvent,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

// Update header status when form becomes dirty
const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
};

window.dispatchEvent(createMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail));
```

### 8.2 From the Shell (listen)

```ts
import {
  MFE_EVENTS,
  isMfeEvent,
} from '@cobranza-apps/mfe-events';

window.addEventListener(MFE_EVENTS.REQUEST_FULLSCREEN, (event: Event) => {
  if (!isMfeEvent(event, MFE_EVENTS.REQUEST_FULLSCREEN)) return;
  const { moduleType, instanceId } = event.detail;
  // Shell navigates to fullscreen for this instance
});
```

### 8.3 Shell → MFE (broadcast + filter)

```ts
// Shell
window.dispatchEvent(
  createShellEvent(SHELL_EVENTS.MODULE_STATE, {
    moduleType: 'clients',
    instanceId: 'inst-abc',
    size: '50%',
    width: 640,
    height: 720,
    isCollapsed: false,
    isFullscreen: false,
  })
);

// Inside MFE
window.addEventListener(SHELL_EVENTS.MODULE_STATE, (event: Event) => {
  if (!isShellEvent(event, SHELL_EVENTS.MODULE_STATE)) return;
  if (event.detail.instanceId !== myInstanceId) return;
  // react to new size / fullscreen flags
});
```

### 8.4 Rules for consumers (document clearly)

1. Only the Shell listens to `mfe:*` events.
2. MFEs never call each other via these events.
3. Every multi-instance payload must include the correct `instanceId` assigned by the Shell.
4. Payloads must remain JSON-serializable.
5. Fullscreen navigation and workbench composition are owned by the Shell; MFEs only *request*.
6. Header **content** (title, status) is owned by the MFE via `UPDATE_HEADER`. Header **actions** visibility (collapse, size, remove, fullscreen buttons) is owned by the Shell / `@cobranza-apps/ui` inputs.

## 9. Relationship to Other Packages

| Package | Relationship |
| --------- | -------------- |
| `@cobranza-apps/ui` | Owns `ModuleHeader` / `ModuleContainer` visuals and the `ModuleStatus` union (keep values in sync). Does **not** dispatch these events; the MFE or Shell does. |
| `@cobranza-apps/entities` | Domain models. Not imported by `mfe-events`. Payloads stay generic (`string`, `Record<string, unknown>`). |
| Shell | Sole owner of workbench state, URL for fullscreen, notification host, and listener for all `mfe:*` events. |
| Individual MFEs | Dispatch `mfe:*`, listen to `shell:*` filtered by `instanceId`. |

**Status alignment note:**  
`ModuleStatus` in this library must stay identical to the status union used by `cba-module-header` in `@cobranza-apps/ui` (`loading | loaded | success | warning | error | dirty | null`).

<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](../../AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
