import { describe, expect, it } from 'vitest';
import { assertMfePayload, assertShellPayload } from '../src/assert.js';
import { MFE_EVENTS, SHELL_EVENTS } from '../src/events.js';
import { SCHEMA_VERSION } from '../src/types.js';
import { MfeEventValidationError } from '../src/validation-error.js';
import { captureError, expectErrorProperty, validThemeChanged, validUpdateHeader } from './helpers.js';

describe('assertMfePayload', () => {
  it('does not throw for a valid payload (A-1)', () => {
    expect(() => assertMfePayload(MFE_EVENTS.UPDATE_HEADER, validUpdateHeader())).not.toThrow();
  });

  it('throws with property "message" and eventType set when a required field is undefined (A-2)', () => {
    const detail = {
      schemaVersion: SCHEMA_VERSION,
      moduleType: 'clients',
      instanceId: 'abc-123',
      message: undefined,
    };
    const error = captureError(() => assertMfePayload(MFE_EVENTS.MODULE_ERROR, detail as never));
    expectErrorProperty(error, 'message');
    expect(error.eventType).toBe(MFE_EVENTS.MODULE_ERROR);
  });
});

describe('assertShellPayload', () => {
  it('does not throw for a valid payload (A-3)', () => {
    expect(() => assertShellPayload(SHELL_EVENTS.THEME_CHANGED, validThemeChanged())).not.toThrow();
  });
});

describe('MfeEventValidationError shape', () => {
  it('is an instance of both MfeEventValidationError and Error (A-4)', () => {
    const detail = { schemaVersion: SCHEMA_VERSION, moduleType: 'clients', instanceId: 'x' };
    const error = captureError(() => assertMfePayload(MFE_EVENTS.MODULE_ERROR, detail as never));
    expect(error).toBeInstanceOf(MfeEventValidationError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('MfeEventValidationError');
  });
});
