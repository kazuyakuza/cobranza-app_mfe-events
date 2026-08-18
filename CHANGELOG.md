# Changelog

All notable changes to `@cobranza-apps/mfe-events` are documented here.
This project adheres to [Keep a Changelog](https://keepachangelog.com/) and uses
[Semantic Versioning](https://semver.org/).

## [0.5.0] - 2026-08-17

### Added
- "Runtime Setup" section in `README.md` explaining the dual-strategy
  `reflect-metadata` loading: Angular builder `scripts` array for browser
  environments vs direct `import 'reflect-metadata'` in Node/test setups.
- Troubleshooting section covering common `reflect-metadata` errors and their
  fixes (`Unable to resolve specifier 'reflect-metadata'`, `Reflect is not
  defined`, `class-validator` failures in tests).
- Concrete consumer setup examples under `docs/examples/`:
  `angular-setup.md`, `vitest-setup.md`, and `jest-setup.md`.
- `reflect-metadata` declared in `peerDependencies` with version range
  `^0.1.12 || ^0.2.0`, making the runtime requirement explicit at install time.

### Changed
- `docs/USAGE.md` §2.5 rewritten with ESM-safe `reflect-metadata` loading
  instructions for both Angular/esbuild and Node/test environments.
- `src/create-event.ts` JSDoc updated to reflect ESM-safe loading requirements
  (no longer recommends `import 'reflect-metadata';` for ESM consumers).

## [0.4.0] - 2026-08-08

### Added
- `ModuleDragState` and `ModulePreviewMode` literal-union types, exported from
  `src/types.ts` as part of the public surface.
- `ModuleStatePayload.dragState?` optional field
  (`'drag-start' | 'drag-end' | 'dropped'`) on `shell:module-state`.
- `ModuleStatePayload.previewMode?` optional field (`'collapsed'`) on
  `shell:module-state`.
- `ModuleStateDto` runtime validation for the new optional fields
  (`@IsOptional()` + `@IsIn(...)`), enforced by `createShellEvent`,
  `dispatchShellEvent`, and `assertShellPayload`.

### Changed
- `docs/USAGE.md` documents the new optional `dragState` and `previewMode`
  fields on `shell:module-state` (event catalog, payload reference, copy-paste
  snippet F).

### Backward Compatibility
- Both new fields are optional. Payloads omitting them validate exactly as
  before. `SCHEMA_VERSION` remains `1`; no breaking changes for existing Shell
  or MFE consumers.
