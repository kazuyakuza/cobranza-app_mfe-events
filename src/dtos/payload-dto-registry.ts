import type { MfeEventName, ShellEventName } from '../events.js';
import { MFE_EVENTS, SHELL_EVENTS } from '../events.js';
import {
  ModuleErrorDto,
  ModuleReadyDto,
  RequestAddModuleDto,
  RequestFullscreenDto,
  RequestRemoveDto,
  ShowNotificationDto,
  UpdateHeaderDto,
} from './mfe-payload-dtos.js';
import {
  ModuleStateDto,
  ThemeChangedDto,
  VisibilityChangedDto,
} from './shell-payload-dtos.js';

/** Constructor of a concrete payload DTO. */
export type PayloadDtoCtor = new () => object;

export const MFE_PAYLOAD_DTOS: Record<MfeEventName, PayloadDtoCtor> = {
  [MFE_EVENTS.REQUEST_ADD_MODULE]: RequestAddModuleDto,
  [MFE_EVENTS.REQUEST_FULLSCREEN]: RequestFullscreenDto,
  [MFE_EVENTS.REQUEST_REMOVE]: RequestRemoveDto,
  [MFE_EVENTS.UPDATE_HEADER]: UpdateHeaderDto,
  [MFE_EVENTS.SHOW_NOTIFICATION]: ShowNotificationDto,
  [MFE_EVENTS.MODULE_READY]: ModuleReadyDto,
  [MFE_EVENTS.MODULE_ERROR]: ModuleErrorDto,
};

export const SHELL_PAYLOAD_DTOS: Record<ShellEventName, PayloadDtoCtor> = {
  [SHELL_EVENTS.MODULE_STATE]: ModuleStateDto,
  [SHELL_EVENTS.THEME_CHANGED]: ThemeChangedDto,
  [SHELL_EVENTS.VISIBILITY_CHANGED]: VisibilityChangedDto,
};

/** Event-name → DTO constructor lookup used by the internal validator. */
export const PAYLOAD_DTO_MAP: Record<string, PayloadDtoCtor> = {
  ...MFE_PAYLOAD_DTOS,
  ...SHELL_PAYLOAD_DTOS,
};
