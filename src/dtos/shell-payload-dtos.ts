import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  ModuleIdentityDto,
  SchemaVersionDto,
} from './module-identity-dto.js';

const MODULE_SIZES = ['50%', '100%'] as const;

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
