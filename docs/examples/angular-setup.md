# Angular Setup — `reflect-metadata` for `@cobranza-apps/mfe-events`

`@cobranza-apps/mfe-events` relies on `class-validator` decorators, which require the `reflect-metadata` polyfill. In Angular projects using `@angular/build:application` (esbuild) or Native Federation with `es-module-shims`, `import 'reflect-metadata'` in `src/main.ts` fails with `Unable to resolve specifier 'reflect-metadata'` because the package is CommonJS-only.

## Solution — load as a global script

Add `reflect-metadata` to the `scripts` array of every relevant target in `angular.json`:

```json
{
  "$schema": "./node_modules/@angular/cli/lib/config/schema.json",
  "projects": {
    "shell": {
      "architect": {
        "build": {
          "options": {
            "scripts": [
              "node_modules/reflect-metadata/Reflect.js"
            ]
          }
        },
        "test": {
          "options": {
            "scripts": [
              "node_modules/reflect-metadata/Reflect.js"
            ]
          }
        }
      }
    }
  }
}
```

## Why this works

The Angular application builder loads entries in `scripts` as traditional global scripts before the application bootstrap. This bypasses the ESM module-shim resolver, so the CommonJS `Reflect.js` file is evaluated and `Reflect.defineMetadata` / `Reflect.getMetadata` are available on `globalThis` before any `@cobranza-apps/mfe-events` import runs.

## What NOT to do

```ts
// src/main.ts — DO NOT do this in Angular esbuild / Native Federation builds
import 'reflect-metadata'; // ❌ Unable to resolve specifier 'reflect-metadata'
import '@cobranza-apps/mfe-events';
```

## Verified example

The Shell project (`cobranza-shell`) uses this exact `angular.json` `scripts` entry and loads `@cobranza-apps/mfe-events` successfully in dev, build, and production.

## See also

- [README §Runtime Setup](../../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Troubleshooting](../troubleshooting.md)