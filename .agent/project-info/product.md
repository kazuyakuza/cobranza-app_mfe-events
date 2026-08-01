# @cobranza-apps/mfe-events — Product

## 1. Product Summary

`@cobranza-apps/mfe-events` is a typed contract library bridging the Company Back-office Shell and its Micro-frontends (MFEs). It defines the event names, payload shapes, and shared types that Shell and MFEs use to communicate, so the contract is enforced by the compiler instead of failing at runtime.

## 2. Users & Consumers

- Primary: Company Back-office Shell (sole listener of `mfe:*`).
- Secondary: all Company Micro-frontends (dispatch `mfe:*`, listen `shell:*`).
- Indirect: human developers and AI agents maintaining Shell/MFEs (consume JSDoc + USAGE.md).
- NOT for: Client Portal end users, mobile/responsive contexts, inter-MFE direct comms.

## 3. Problem Definition

- Untyped CustomEvent payloads cause runtime errors and silent drift between Shell and MFEs.
- No single source of truth for event names and payload shapes.
- Cross-team contract changes break silently.
- Multi-instance scenarios (same remote mounted N times) lack identity discipline.

## 4. Product Goals

- Type-safe event contracts: every event has a payload type; no `detail: any`.
- Stable, prefixed, kebab-case event names (`mfe:*` / `shell:*`); evolve via new optional fields + package semver, never by renaming.
- JSON-serializable-only payloads (no functions, DOM nodes, class instances).
- Multi-instance aware (`moduleType` + `instanceId` on almost every payload).
- Shell-is-listener rule enforced by design (MFEs do not listen to `mfe:*` of siblings).
- AI-agent friendly docs (JSDoc on every export; copy-paste USAGE examples).

## 5. Non-Goals (v1)

- No business logic or domain-specific events.
- No Angular runtime, components, services, DI.
- No event bus abstraction, RxJS, or NgModules.
- No auth/token distribution, no WORKSPACE_CONTEXT broadcast.
- No mobile/responsive concerns.
- No inter-MFE direct communication.

## 6. Success Criteria

- All consumers can import events/payloads/types/helpers from a single entry.
- Type-checking fails at compile time on wrong payload shapes.
- ModuleStatus values stay identical to @cobranza-apps/ui cba-module-header.
- USAGE.md covers both dispatch (MFE) and listen (Shell) sides with copy-paste examples.

## 7. Relationships (product view)

- @cobranza-apps/ui: owns visuals/ModuleHeader; mfe-events owns contracts only.
- @cobranza-apps/entities: domain models; not imported here.
- Shell: host of workbench, fullscreen URL, notifications, sole `mfe:*` listener.
- MFEs: dispatch `mfe:*`, filter `shell:*` by instanceId.

<!-- DO NOT DELETE NEXT SECTION -->

## Important Note for AI Agents

All agents working on this project MUST adhere to the workflows and rules outlined in [AI Agent Onboarding document](../../AGENTS.md).

Before starting any task:

1. **Review `AGENTS.md`**: is the primary source of instructions for agents.
2. **Follow Workflows**: follow the procedures defined in `.agent/WORKFLOWS.md`, especially the `.kilo/commands/critical-workflow.md`.

<!-- END DO NOT DELETE -->
