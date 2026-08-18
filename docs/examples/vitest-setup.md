# Vitest Setup — `reflect-metadata` for `@cobranza-apps/mfe-events`

In Node-based test runners (Vitest), `reflect-metadata` resolves natively as a CommonJS package, so a direct `import` is the correct strategy.

## 1. Install the polyfill (peer dependency)

```bash
npm install reflect-metadata
# or
pnpm add reflect-metadata
```

## 2. Create a setup file

```ts
// src/test/reflect-metadata-setup.ts
import 'reflect-metadata';
```

## 3. Reference it from `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['src/test/reflect-metadata-setup.ts'],
  },
});
```

## Why this works

Vitest's Node environment resolves the CommonJS `node_modules/reflect-metadata` package natively. The setup file runs once before any spec file imports `@cobranza-apps/mfe-events`.

## See also

- [README §Runtime Setup](../../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Troubleshooting](../troubleshooting.md)