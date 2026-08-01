import { expect } from 'vitest';
import type { ModuleStatePayload, UpdateHeaderPayload } from '../src/payloads.js';
import { SCHEMA_VERSION } from '../src/types.js';
import { MfeEventValidationError } from '../src/validation-error.js';

export function validUpdateHeader(): UpdateHeaderPayload {
  return {
    schemaVersion: SCHEMA_VERSION,
    moduleType: 'clients',
    instanceId: 'abc-123',
    title: 'Clientes',
    status: 'loaded',
  };
}

export function validModuleState(): ModuleStatePayload {
  return {
    schemaVersion: SCHEMA_VERSION,
    moduleType: 'clients',
    instanceId: 'abc-123',
    size: '100%',
    width: 800,
    height: 600,
    isCollapsed: false,
    isFullscreen: false,
  };
}

export function validThemeChanged() {
  return { schemaVersion: SCHEMA_VERSION, theme: 'gray-intermediate' };
}

export function validRequestAddModule() {
  return { schemaVersion: SCHEMA_VERSION, moduleType: 'clients' };
}

export function validVisibilityChanged() {
  return {
    schemaVersion: SCHEMA_VERSION,
    moduleType: 'clients',
    instanceId: 'abc-123',
    visible: true,
  };
}

export function captureError(action: () => void): MfeEventValidationError {
  try {
    action();
    throw new Error('Expected action to throw MfeEventValidationError');
  } catch (error) {
    expect(error).toBeInstanceOf(MfeEventValidationError);
    return error as MfeEventValidationError;
  }
}

export function expectErrorProperty(error: MfeEventValidationError, property: string): void {
  expect(error.errors.map((entry) => entry.property)).toContain(property);
}
