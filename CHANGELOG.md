# Changelog

All notable changes to `@cobranza-apps/mfe-events` are documented here.
This project adheres to [Keep a Changelog](https://keepachangelog.com/) and uses
[Semantic Versioning](https://semver.org/).

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
