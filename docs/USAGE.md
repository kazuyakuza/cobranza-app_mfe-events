# @cobranza-apps/mfe-events — Usage Guide

Practical, copy-paste guide for Shell and MFE consumers. Written with AI agents
as first-class readers: every section states **who emits / who listens**, which
payload fields are required, and how multi-instance works. Every snippet uses
real exports from the package — no invented APIs.

## Table of Contents

- [2.1 Overview](#21-overview)
- [2.2 Core rules (must follow)](#22-core-rules-must-follow)
- [2.3 Event catalog](#23-event-catalog)
- [2.4 Payload reference](#24-payload-reference)
- [2.5 Helpers](#25-helpers)
- [2.6 Copy-paste patterns](#26-copy-paste-patterns)
- [2.7 Multi-instance guidance](#27-multi-instance-guidance)
- [2.8 Relationship to `@cobranza-apps/ui`](#28-relationship-to-cobranza-appsui)
- [See also](#see-also)

### 2.1 Overview

**What this library provides:**

- `MFE_EVENTS` / `SHELL_EVENTS` — frozen event name constants (`mfe:*` / `shell:*`).
- Strongly typed `*Payload` interfaces for every event.
- `MfeEventMap` / `ShellEventMap` — event-name → payload mappings for type-safe dispatch and listen.
- `SCHEMA_VERSION` — the required `schemaVersion` constant.
- `createMfeEvent` / `createShellEvent` / `dispatchMfeEvent` / `dispatchShellEvent` — runtime-validated event creation and dispatch.
- `isMfeEvent` / `isShellEvent` — cheap type-guard listeners.
- `assertMfePayload` / `assertShellPayload` — payload-only validators (no event construction).
- `MfeEventValidationError` — the error thrown by all validators/creators/dispatchers.

**What it deliberately does NOT provide:**

- An event bus class or RxJS subjects.
- Angular services / components / DI.
- Workspace layout logic (owned by the Shell).
- BFF/API communication.
- UI chrome (owned by `@cobranza-apps/ui`).
- DOM manipulation by MFEs outside their own container.

### 2.2 Core rules (must follow)

1. **Only the Shell** listens to `mfe:*` events.
2. **MFEs never communicate with each other** through these events — use the Shell or a BFF.
3. Almost every payload carries `moduleType` + `instanceId` (a UUID from the Shell) for multi-instance support.
4. Payloads **must be JSON-serializable** — no functions, class instances, or DOM nodes in `detail`.
5. `schemaVersion` is **required** on every payload and must equal `SCHEMA_VERSION`.
6. Fullscreen navigation and workbench composition are owned by the Shell; MFEs only *request*.
7. Header **content** (title, status) is owned by the MFE via `UPDATE_HEADER`; header **action visibility** is owned by the Shell / `@cobranza-apps/ui`.

### 2.3 Event catalog

**MFE → Shell** (emitted by an MFE, listened to by the Shell only):

| Constant | Event name | Purpose | Payload |
|---|---|---|---|
| `REQUEST_ADD_MODULE` | `mfe:request-add-module` | Ask the Shell to add a new module instance to the workbench | `RequestAddModulePayload` |
| `REQUEST_FULLSCREEN` | `mfe:request-fullscreen` | Ask the Shell to switch this instance to fullscreen | `RequestFullscreenPayload` |
| `REQUEST_REMOVE` | `mfe:request-remove` | Ask the Shell to remove this instance from the workbench | `RequestRemovePayload` |
| `UPDATE_HEADER` | `mfe:update-header` | MFE updates its own header chrome (title, status) | `UpdateHeaderPayload` |
| `SHOW_NOTIFICATION` | `mfe:show-notification` | Ask the Shell to show a global toast/notification | `ShowNotificationPayload` |
| `MODULE_READY` | `mfe:module-ready` | MFE finished mounting and is ready | `ModuleReadyPayload` |
| `MODULE_ERROR` | `mfe:module-error` | Unrecoverable load/init error for this instance | `ModuleErrorPayload` |

**Shell → MFE** (emitted by the Shell, listened to by MFE instances; filter by `instanceId`):

| Constant | Event name | Purpose | Payload |
|---|---|---|---|
| `MODULE_STATE` | `shell:module-state` | Notify size / collapse / fullscreen / pixel dimensions for this instance | `ModuleStatePayload` |
| `THEME_CHANGED` | `shell:theme-changed` | Theme token set changed (global) | `ThemeChangedPayload` |
| `VISIBILITY_CHANGED` | `shell:visibility-changed` | Instance became visible or hidden | `VisibilityChangedPayload` |

**Deferred (not in v1 — do not invent these):** `WORKSPACE_CONTEXT`, auth / session / token events, domain-specific events (`mfe:client:*`, etc.), and notification actions.

### 2.4 Payload reference

Fields marked `required` are enforced at runtime; `?` is optional. `ModuleIdentity`
provides `moduleType: string` and `instanceId: string`.

```
RequestAddModulePayload
  moduleType    string              Required. Which remote to add.
  title?        string              Optional initial header title.
  initialData?  Record<string, unknown>  Optional opaque data for the new instance.
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
RequestFullscreenPayload (extends ModuleIdentity → moduleType, instanceId)
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
RequestRemovePayload (extends ModuleIdentity → moduleType, instanceId)
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
UpdateHeaderPayload (extends ModuleIdentity → moduleType, instanceId)
  title?        string              Optional new header title.
  status?       ModuleStatus        Optional status (loading|loaded|success|warning|error|dirty|null).
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
ShowNotificationPayload  (no module identity — global)
  type          'success'|'warning'|'error'|'info'  Required.
  message       string              Required.
  title?        string              Optional.
  duration?     number              Optional auto-dismiss in ms; Shell may apply a default.
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
ModuleReadyPayload (extends ModuleIdentity → moduleType, instanceId)
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
ModuleErrorPayload (extends ModuleIdentity → moduleType, instanceId)
  message       string              Required.
  code?         string              Optional machine-readable code.
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
ModuleStatePayload (extends ModuleIdentity → moduleType, instanceId)
  size          '50%'|'100%'        Required width fraction.
  width         number              Required CSS pixel width of the module container.
  height        number              Required CSS pixel height of the module container.
  isCollapsed   boolean             Required.
  isFullscreen  boolean             Required.
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
ThemeChangedPayload  (no module identity — global)
  theme         'gray-intermediate' | string  Required theme identifier.
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

```
VisibilityChangedPayload (extends ModuleIdentity → moduleType, instanceId)
  visible       boolean             Required.
  reason?       'fullscreen'|'collapse'|'workbench'|string  Optional.
  schemaVersion number              Required; === SCHEMA_VERSION (1)
```

**Specials to remember:**

- `ShowNotificationPayload` — no `moduleType` / `instanceId` (global).
- `ThemeChangedPayload` — no `moduleType` / `instanceId` (global).
- `RequestAddModulePayload` — has `moduleType` but **no** `instanceId` (the instance does not exist yet).

### 2.5 Helpers

- **`createMfeEvent` / `createShellEvent`** — create a validated `CustomEvent` (`bubbles: true`). Throws `MfeEventValidationError` on invalid shape, missing/mismatched `schemaVersion`, or unknown event type. Use when you need the event object (e.g. dispatch on a scoped target later).
- **`dispatchMfeEvent` / `dispatchShellEvent`** — validate + dispatch in one call; default target is `window`. Pass `DispatchOptions.target` for SSR, tests, or scoped elements. Throws `MfeEventValidationError` (invalid payload) or `Error` (no `window` and no explicit target).
- **`isMfeEvent` / `isShellEvent`** — cheap `event instanceof CustomEvent && event.type === type` narrowing guards. **Do not** re-validate inside hot listeners (use `assert*` only when you must validate).
- **`assertMfePayload` / `assertShellPayload`** — validate without building/dispatching an event; same exceptions as the creators. Useful for pre-checks before proxying an inbound event.
- **`MfeEventValidationError`** — error class carrying `.errors` (per-field messages) and `.eventType`.
- **`reflect-metadata` requirement:** import `reflect-metadata` **once at the app entry** before the first import of `@cobranza-apps/mfe-events`:

```ts
import 'reflect-metadata';
```

The library does **not** import it itself (it avoids forcing a global side effect on every consumer). It is required because the runtime validators use `class-validator` decorators on internal DTOs.

### 2.6 Copy-paste patterns

**A. MFE — update header when form is dirty**

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

**B. MFE — request fullscreen**

```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type RequestFullscreenPayload,
} from '@cobranza-apps/mfe-events';

const detail: RequestFullscreenPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.REQUEST_FULLSCREEN, detail);
```

**C. MFE — module ready on init**

```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type ModuleReadyPayload,
} from '@cobranza-apps/mfe-events';

const detail: ModuleReadyPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.MODULE_READY, detail);
```

**D. MFE — show notification** (no `instanceId`; global)

```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  type ShowNotificationPayload,
} from '@cobranza-apps/mfe-events';

const detail: ShowNotificationPayload = {
  type: 'success',
  message: 'Cliente guardado correctamente.',
  schemaVersion: SCHEMA_VERSION,
};

dispatchMfeEvent(MFE_EVENTS.SHOW_NOTIFICATION, detail);
```

**E. Shell — listen for fullscreen request**

```ts
import { MFE_EVENTS, isMfeEvent } from '@cobranza-apps/mfe-events';

window.addEventListener(MFE_EVENTS.REQUEST_FULLSCREEN, (event: Event) => {
  if (!isMfeEvent(event, MFE_EVENTS.REQUEST_FULLSCREEN)) return;
  const { moduleType, instanceId } = event.detail;
  // navigate / replace workbench with this instance
});
```

**F. Shell — broadcast module state**

```ts
import {
  SHELL_EVENTS,
  SCHEMA_VERSION,
  dispatchShellEvent,
  type ModuleStatePayload,
} from '@cobranza-apps/mfe-events';

const detail: ModuleStatePayload = {
  moduleType: 'clients',
  instanceId: 'inst-abc',
  size: '50%',
  width: 640,
  height: 720,
  isCollapsed: false,
  isFullscreen: false,
  schemaVersion: SCHEMA_VERSION,
};

dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, detail);
```

**G. MFE — filter shell state by instanceId**

```ts
import { SHELL_EVENTS, isShellEvent } from '@cobranza-apps/mfe-events';

window.addEventListener(SHELL_EVENTS.MODULE_STATE, (event: Event) => {
  if (!isShellEvent(event, SHELL_EVENTS.MODULE_STATE)) return;
  if (event.detail.instanceId !== myInstanceId) return;
  // apply size / fullscreen / collapse
});
```

**H. Handling validation errors**

```ts
import {
  MFE_EVENTS,
  SCHEMA_VERSION,
  dispatchMfeEvent,
  MfeEventValidationError,
  type UpdateHeaderPayload,
} from '@cobranza-apps/mfe-events';

const detail: UpdateHeaderPayload = {
  moduleType: 'clients',
  instanceId: myInstanceId,
  status: 'dirty',
  title: 'Clientes — sin guardar',
  schemaVersion: SCHEMA_VERSION,
};

try {
  dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, detail);
} catch (error) {
  if (error instanceof MfeEventValidationError) {
    console.error('[mfe-events] invalid', error.eventType, error.errors);
  } else {
    throw error;
  }
}
```

> See also: [Anti-patterns](anti-patterns.md) — omitting `schemaVersion` is anti-pattern #3.

### 2.7 Multi-instance guidance

- **Why `instanceId` exists:** the same `moduleType` (e.g. `'clients'`) can appear multiple times in the workbench with different filters/state; `instanceId` disambiguates them.
- **Who generates it:** the Shell generates a UUID when adding a module. The MFE must receive it (Angular `Input` or equivalent) and echo it on **every** `mfe:*` event it dispatches.
- **Filtering rule** for `shell:*` listeners in MFEs: always guard with `if (event.detail.instanceId !== myInstanceId) return;` first (see snippet G). Global payloads (`ThemeChangedPayload`) need no filter.

### 2.8 Relationship to `@cobranza-apps/ui`

- `ModuleStatus` values (`loading | loaded | success | warning | error | dirty | null`) MUST stay identical to the `status` union of `cba-module-header` in `@cobranza-apps/ui`. Keep them in sync across packages.
- `@cobranza-apps/ui` does **not** dispatch these events; the MFE or the Shell does. `mfe-events` is the contract; `@cobranza-apps/ui` is the visual chrome.
- Header chrome **action buttons** (collapse, size toggle, remove, fullscreen) visibility is owned by the Shell / `@cobranza-apps/ui` inputs. Header **content** (title, status) is owned by the MFE via `UPDATE_HEADER`.

## See also

- [`README.md`](../README.md) — overview, install, event catalog summary.
- [Anti-patterns](anti-patterns.md) — what NOT to do and why.
- [`.agent/project-info/brief.md`](../.agent/project-info/brief.md) — authoritative source of truth.
