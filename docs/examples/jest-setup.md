# Jest Setup — `reflect-metadata` for `@cobranza-apps/mfe-events`

In Jest (Node environment), `reflect-metadata` resolves natively as a CommonJS package, so a direct `import` (or `require`) in the setup file is the correct strategy.

## 1. Install the polyfill (peer dependency)

```bash
npm install reflect-metadata
# or
pnpm add reflect-metadata
```

## 2. Create a setup file

```ts
// test/setup-reflect-metadata.ts
import 'reflect-metadata';
```

For CommonJS Jest configs:

```js
// test/setup-reflect-metadata.js
require('reflect-metadata');
```

## 3. Reference it from `jest.config.js`

```js
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup-reflect-metadata.js'],
};
```

Or, with `ts-jest` / `@swc/jest`, point to the `.ts` variant:

```js
module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/test/setup-reflect-metadata.ts'],
};
```

## Why this works

Jest's Node environment resolves the CommonJS `node_modules/reflect-metadata` package natively. `setupFiles` run once before any test file imports `@cobranza-apps/mfe-events`.

## See also

- [README §Runtime Setup](../../README.md#runtime-setup)
- [USAGE.md §2.5 Helpers](../USAGE.md#25-helpers)
- [Troubleshooting](../troubleshooting.md)