import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import type { ModuleDragState, ModulePreviewMode } from '../types.js';
import {
  ModuleIdentityDto,
  SchemaVersionDto,
} from './module-identity-dto.js';

const MODULE_SIZES = ['50%', '100%'] as const;
const DRAG_STATES = ['drag-start', 'drag-end', 'dropped'] as const;
const PREVIEW_MODES = ['collapsed'] as const;

/** `shell:module-state` payload validation shape. */
export class ModuleStateDto extends ModuleIdentityDto {
  @IsIn(MODULE_SIZES)
  size!: '50%' | '100%';

  @IsNumber()
  width!: number;

  @IsNumber()
  height!: number;

  @IsBoolean()
  isCollapsed!: boolean;

  @IsBoolean()
  isFullscreen!: boolean;

  /** Current drag lifecycle state. Optional; values: `'drag-start' | 'drag-end' | 'dropped'`. */
  @IsOptional()
  @IsIn(DRAG_STATES)
  dragState?: ModuleDragState;

  /** Visual preview mode during drag. Optional; values: `'collapsed'`. */
  @IsOptional()
  @IsIn(PREVIEW_MODES)
  previewMode?: ModulePreviewMode;
}

/** `shell:theme-changed` payload validation shape. */
export class ThemeChangedDto extends SchemaVersionDto {
  @IsString()
  theme!: string;
}

/** `shell:visibility-changed` payload validation shape. */
export class VisibilityChangedDto extends ModuleIdentityDto {
  @IsBoolean()
  visible!: boolean;

  @IsOptional()
  @IsString()
  reason?: string;
}
