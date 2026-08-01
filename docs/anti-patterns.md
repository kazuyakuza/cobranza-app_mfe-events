# Anti-patterns — @cobranza-apps/mfe-events

These patterns break the Shell–MFE contract. AI agents writing or reviewing code
must avoid them. Each entry shows the **Don't** (bad), the **Do** (good), and
**Why** it matters.

## Table of Contents

- [#1 Listening to `mfe:*` from inside an MFE](#1-listening-to-mfe-from-inside-an-mfe)
- [#2 Dispatching `shell:*` from an MFE](#2-dispatching-shell-from-an-mfe)
- [#3 Omitting `schemaVersion` or hard-coding a wrong version](#3-omitting-schemaversion-or-hard-coding-a-wrong-version)
- [#4 Putting functions / class instances / DOM nodes in `detail`](#4-putting-functions--class-instances--dom-nodes-in-detail)
- [#5 Using domain event names (`mfe:client:open`) instead of generic catalog + payload data](#5-using-domain-event-names-mfeclientopen-instead-of-generic-catalog--payload-data)
- [#6 Building a shared RxJS bus inside this package](#6-building-a-shared-rxjs-bus-inside-this-package)
- [See also](#see-also)

### #1 Listening to `mfe:*` from inside an MFE

**Don't** — an MFE adds a `mfe:*` listener to observe siblings:

```ts
window.addEventListener('mfe:update-header', (event) => {
  // observes another module — wrong direction
});
```

**Do** — only the Shell listens to `mfe:*`; MFEs listen to `shell:*` filtered by
`instanceId` (see [USAGE §2.2](USAGE.md#22-core-rules-must-follow), snippet G).

**Why** — `mfe:*` events are MFE→Shell contracts; siblings must not observe each
other. Observing them couples modules and breaks the broadcast + filter model
(brief §2.3, §8.4 rules 1–2).

### #2 Dispatching `shell:*` from an MFE

**Don't** — an MFE dispatches authoritative Shell state:

```ts
dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, payload);
```

**Do** — MFEs dispatch `mfe:*` to request changes; only the Shell dispatches
`shell:*` (see [USAGE snippet A/D](USAGE.md#26-copy-paste-patterns)).

**Why** — Shell→MFE events represent authoritative state. An MFE dispatching them
would corrupt the broadcast + filter model and break multi-instance handling
(brief §8.4 rule 6).

### #3 Omitting `schemaVersion` or hard-coding a wrong version

**Don't** — spread a payload without `schemaVersion`, or hard-code a literal:

```ts
dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, { moduleType, instanceId, title });
```

**Do** — always import `SCHEMA_VERSION` and set `schemaVersion: SCHEMA_VERSION`
on every payload (see [USAGE snippet A](USAGE.md#26-copy-paste-patterns)).
`createMfeEvent` / `dispatchMfeEvent` throw `MfeEventValidationError` otherwise
(see [USAGE snippet H](USAGE.md#26-copy-paste-patterns)).

**Why** — `schemaVersion` is required for payload evolution; mismatched versions
break consumers on upgrade (brief §6.1).

### #4 Putting functions / class instances / DOM nodes in `detail`

**Don't** — attach non-serializable values:

```ts
dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, {
  moduleType, instanceId, schemaVersion: SCHEMA_VERSION,
  onSave: () => save(), // function — not serializable
  element: document.querySelector('#form'), // DOM node — not serializable
});
```

**Do** — keep payloads plain JSON-serializable data (primitives, plain objects,
arrays). Pass behaviour hints as string codes, not callbacks.

**Why** — `detail` travels inside a `CustomEvent` and must survive serialization
boundaries, `postMessage`, and devtools inspection (brief §2.3 design principles).

### #5 Using domain event names (`mfe:client:open`) instead of generic catalog + payload data

**Don't** — invent domain-specific events:

```ts
window.dispatchEvent(new CustomEvent('mfe:client:open', { detail }));
```

**Do** — use the generic catalog (`MFE_EVENTS.REQUEST_ADD_MODULE` +
`initialData`) and put domain specifics inside `initialData` / payload fields.

**Why** — event names are stable forever; domain proliferation explodes the
contract and breaks the naming rules (brief §5.1; domain-specific events are out
of scope).

### #6 Building a shared RxJS bus inside this package

**Don't** — add a `Subject`, `BehaviorSubject`, or an `EventBus` class to
`mfe-events`.

**Do** — keep helpers thin over `CustomEvent` / `window`. RxJS in the Shell/MFE
apps is fine — just not in this library.

**Why** — this package is a typed contract + thin helpers, intentionally
framework-free. A bus inside it would force a runtime dependency on every
consumer and collide with consumer-side buses (brief §2.2, §7).

## See also

- [`README.md`](../README.md) — overview, install, event catalog summary.
- [USAGE.md](USAGE.md) — core rules and copy-paste patterns.
- [`.agent/project-info/brief.md`](../.agent/project-info/brief.md) — authoritative source of truth.
