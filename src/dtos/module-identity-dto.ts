import { IsNumber, IsString } from 'class-validator';

/** Base carrying the required schema version shared by every payload DTO. */
export abstract class SchemaVersionDto {
  @IsNumber()
  schemaVersion!: number;
}

/** Base for payloads that include module identity. */
export abstract class ModuleIdentityDto extends SchemaVersionDto {
  @IsString()
  moduleType!: string;

  @IsString()
  instanceId!: string;
}
