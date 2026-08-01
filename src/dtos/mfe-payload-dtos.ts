import {
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import type { ModuleStatus } from '../types.js';
import {
  ModuleIdentityDto,
  SchemaVersionDto,
} from './module-identity-dto.js';

const NOTIFICATION_TYPES = ['success', 'warning', 'error', 'info'] as const;
const STATUS_VALUES = ['loading', 'loaded', 'success', 'warning', 'error', 'dirty'] as const;

/** `mfe:request-add-module` payload validation shape. */
export class RequestAddModuleDto extends SchemaVersionDto {
  @IsString()
  moduleType!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsObject()
  initialData?: Record<string, unknown>;
}

/** `mfe:request-fullscreen` payload validation shape. */
export class RequestFullscreenDto extends ModuleIdentityDto {}

/** `mfe:request-remove` payload validation shape. */
export class RequestRemoveDto extends ModuleIdentityDto {}

/** `mfe:update-header` payload validation shape. */
export class UpdateHeaderDto extends ModuleIdentityDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: ModuleStatus;
}

/** `mfe:show-notification` payload validation shape. */
export class ShowNotificationDto extends SchemaVersionDto {
  @IsIn(NOTIFICATION_TYPES)
  type!: 'success' | 'warning' | 'error' | 'info';

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;
}

/** `mfe:module-ready` payload validation shape. */
export class ModuleReadyDto extends ModuleIdentityDto {}

/** `mfe:module-error` payload validation shape. */
export class ModuleErrorDto extends ModuleIdentityDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  code?: string;
}
