# Troubleshooting — `@cobranza-apps/mfe-events` / `reflect-metadata`

`@cobranza-apps/mfe-events` uses `class-validator` decorators on internal DTOs. `class-validator` needs the `reflect-metadata` polyfill loaded **before** the first call to any creator / dispatcher / assert helper. `reflect-metadata` is a CommonJS-only package, so the loading strategy differs by environment. See [README §Runtime Setup](../README.md#runtime-setup) and [USAGE.md §2.5](../USAGE.md#25-helpers).

## Common errors

| Error | Cause | Fix |
| --- | --- | --- |
| `Unable to resolve specifier 'reflect-metadata'` | `import 'reflect-metadata'` used in an ESM entry (`src/main.ts`, Native Federation, Vite dev server). `es-module-shims` cannot resolve the CommonJS specifier. | Remove the `import 'reflect-metadata'` line from `src/main.ts`. Load the polyfill as a global script via the builder `scripts` array: `"scripts": ["node_modules/reflect-metadata/Reflect.js"]` in `angular.json`. See [examples/angular-setup.md](examples/angular-setup.md). |
| `Reflect is not defined` (or `Reflect.getMetadata is not a function`) | The polyfill was not loaded before the first `@cobranza-apps/mfe-events` import, or the `scripts` entry was added to the wrong target. | Ensure the `scripts` entry is on the active build/test target and runs before app bootstrap. Verify `node_modules/reflect-metadata/Reflect.js` exists after `npm install`. |
| `class-validator` / `class-transformer` errors in unit tests (`Validation failed`, `isClassValidator` not a decorator`, empty `errors[]`) | `reflect-metadata` not loaded in the test environment. | Add `reflect-metadata` to the test runner's `setupFiles`. See [examples/vitest-setup.md](examples/vitest-setup.md) / [examples/jest-setup.md](examples/jest-setup.md). |

## Checklist

1. `reflect-metadata` is installed at the consumer (the library declares it as a required peer dependency).
2. In Angular: `angular.json` `scripts` includes `node_modules/reflect-metadata/Reflect.js` on every target that loads the app.
3. In tests: the test runner `setupFiles` imports `reflect-metadata` before any spec imports `@cobranza-apps/mfe-events`.
4. No `import 'reflect-metadata'` in any ESM entry consumed by `es-module-shims` / Native Federation.

## See also

- [README §Runtime Setup](../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Consumer setup examples](examples/)