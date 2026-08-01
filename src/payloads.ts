/**
 * @file Payload interfaces for Shell–MFE events.
 *
 * Each event defined in `events.ts` has a corresponding strongly typed payload
 * interface in this module. Payloads are plain, JSON-serializable data objects
 * — no functions, DOM nodes, or class instances.
 *
 * @see {@link file://./events.ts} for the event name constants.
 * @see {@link file://./types.ts} for `EventMap` types that link events to payloads.
 */

import type {
  ModuleIdentity,
  ModuleSize,
  ModuleStatus,
} from './types.js';

/**
 * `mfe:request-add-module` payload. Emitted by an MFE (or cross-module
 * navigation) to ask the Shell to add a new module instance to the workbench.
 * Listened to by the Shell only. `schemaVersion` required (use `SCHEMA_VERSION`).
 */
export interface RequestAddModulePayload {
  /** Which remote to add. */
  moduleType: string;
  /** Optional initial title shown in the header. */
  title?: string;
  /** Opaque data the new instance may read (filters, preselected id, etc.). */
  initialData?: Record<string, unknown>;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:request-fullscreen` payload. Emitted by an MFE instance to ask the Shell
 * to switch THIS instance to fullscreen (Shell owns URL change + workbench
 * replacement). Listened to by the Shell only. `schemaVersion` required.
 */
export interface RequestFullscreenPayload extends ModuleIdentity {
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:request-remove` payload. Emitted by an MFE instance to ask the Shell to
 * remove THIS instance from the workbench. Listened to by the Shell only.
 * `schemaVersion` required.
 */
export interface RequestRemovePayload extends ModuleIdentity {
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:update-header` payload. Emitted by an MFE to update its own header chrome
 * data (title, status). Header action buttons visibility is owned by the Shell /
 * `@cobranza-apps/ui`. Listened to by the Shell only. `schemaVersion` required.
 */
export interface UpdateHeaderPayload extends ModuleIdentity {
  /** Optional new header title. */
  title?: string;
  /** Optional new header status (aligned with `@cobranza-apps/ui` `ModuleHeader`). */
  status?: ModuleStatus;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:show-notification` payload. Emitted by an MFE to ask the Shell to show a
 * global toast/notification (no module identity — Shell hosts the UI). Listened
 * to by the Shell only. `schemaVersion` required.
 */
export interface ShowNotificationPayload {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  title?: string;
  /** Auto-dismiss in ms; Shell may apply a default if omitted. */
  duration?: number;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:module-ready` payload. Emitted by an MFE when it finished mounting and is
 * ready (Shell can hide skeleton, register instance). Listened to by the Shell
 * only. `schemaVersion` required.
 */
export interface ModuleReadyPayload extends ModuleIdentity {
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `mfe:module-error` payload. Emitted by an MFE on an unrecoverable load/init
 * error for THIS instance. Listened to by the Shell only. `schemaVersion` required.
 */
export interface ModuleErrorPayload extends ModuleIdentity {
  message: string;
  /** Optional machine-readable code. */
  code?: string;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `shell:module-state` payload. Emitted by the Shell to notify THIS instance of
 * its size / collapse / fullscreen / pixel dimensions. Listened to by the target
 * MFE instance (filter by `instanceId`). `schemaVersion` required.
 */
export interface ModuleStatePayload extends ModuleIdentity {
  size: ModuleSize;
  /** Actual CSS pixel width of the module container. */
  width: number;
  /** Actual CSS pixel height of the module container. */
  height: number;
  isCollapsed: boolean;
  isFullscreen: boolean;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `shell:theme-changed` payload. Emitted by the Shell when the theme token set
 * changed (global — no module identity). Listened to by all MFE instances.
 * `schemaVersion` required.
 */
export interface ThemeChangedPayload {
  /** Theme identifier; currently only 'gray-intermediate' is expected. */
  theme: 'gray-intermediate' | string;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}

/**
 * `shell:visibility-changed` payload. Emitted by the Shell when an instance
 * became visible or hidden (fullscreen enter/exit, collapse, or workbench
 * visibility). Listened to by the target MFE instance (filter by `instanceId`).
 * `schemaVersion` required.
 */
export interface VisibilityChangedPayload extends ModuleIdentity {
  visible: boolean;
  reason?: 'fullscreen' | 'collapse' | 'workbench' | string;
  /** Required; must equal `SCHEMA_VERSION` for this library major. */
  schemaVersion: number;
}
