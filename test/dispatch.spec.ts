import { afterEach, describe, expect, it, vi } from 'vitest';
import { dispatchMfeEvent, dispatchShellEvent } from '../src/dispatch.js';
import { MFE_EVENTS, SHELL_EVENTS } from '../src/events.js';
import type { ModuleStatePayload, UpdateHeaderPayload } from '../src/payloads.js';
import { SCHEMA_VERSION } from '../src/types.js';
import { MfeEventValidationError } from '../src/validation-error.js';

const originalWindow = (globalThis as { window?: unknown }).window;

function validUpdateHeader(): UpdateHeaderPayload {
  return {
    schemaVersion: SCHEMA_VERSION,
    moduleType: 'clients',
    instanceId: 'abc-123',
    title: 'Clientes',
    status: 'loaded',
  };
}

function validModuleState(): ModuleStatePayload {
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

afterEach(() => {
  if (originalWindow === undefined) {
    delete (globalThis as { window?: unknown }).window;
  } else {
    (globalThis as { window?: unknown }).window = originalWindow;
  }
});

describe('dispatchMfeEvent', () => {
  it('dispatches a CustomEvent of the right type on the given target (D-1)', () => {
    const target = new EventTarget();
    const dispatchSpy = vi.spyOn(target, 'dispatchEvent');
    dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, validUpdateHeader(), { target });
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const dispatched = dispatchSpy.mock.calls[0]?.[0] as CustomEvent;
    expect(dispatched.type).toBe(MFE_EVENTS.UPDATE_HEADER);
  });

  it('throws before dispatching when the detail is invalid (D-3)', () => {
    const target = new EventTarget();
    const dispatchSpy = vi.spyOn(target, 'dispatchEvent');
    const invalidDetail = { moduleType: 'clients', instanceId: 'abc-123' };
    expect(() => dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, invalidDetail as never, { target })).toThrowError(
      MfeEventValidationError,
    );
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('dispatches on window when target is omitted (D-4)', () => {
    const windowStub = new EventTarget();
    const dispatchSpy = vi.spyOn(windowStub, 'dispatchEvent');
    (globalThis as { window?: unknown }).window = windowStub;
    dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, validUpdateHeader());
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
  });

  it('throws a plain Error when target is omitted and window is unavailable (D-5)', () => {
    delete (globalThis as { window?: unknown }).window;
    expect(() => dispatchMfeEvent(MFE_EVENTS.UPDATE_HEADER, validUpdateHeader())).toThrowError(/dispatch target/);
  });
});

describe('dispatchShellEvent', () => {
  it('dispatches a CustomEvent of the right type on the given target (D-2)', () => {
    const target = new EventTarget();
    const dispatchSpy = vi.spyOn(target, 'dispatchEvent');
    dispatchShellEvent(SHELL_EVENTS.MODULE_STATE, validModuleState(), { target });
    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    const dispatched = dispatchSpy.mock.calls[0]?.[0] as CustomEvent;
    expect(dispatched.type).toBe(SHELL_EVENTS.MODULE_STATE);
  });
});
