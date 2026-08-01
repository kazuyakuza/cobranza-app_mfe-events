# Simplification Plan — Task 1: Project Scaffold & Package Bootstrap

**TODO file:** `.agent/todos/20260631/20260631-todo-1.md`  
**Implementation plan:** `.kilo/plans/20260801-project-scaffold-and-package-bootstrap-task1.md`  
**Branch:** `feat/project-scaffold-package-bootstrap`  
**Date:** 2026-08-01

---

## Summary

The implementation produced in step 4.2 is already minimal and directly satisfies the TODO requirements. The source files are empty placeholders (as preferred), the package is ESM-only with a single public entry, and the build is plain `tsc`. No major simplifications are possible without violating the TODO or reducing forward compatibility.

This plan proposes a small set of **low-risk, optional** simplifications to `tsconfig.json` and `package.json` only. All proposed changes preserve the required TODO behavior: ESM-first, `strict`, `declaration` + `declarationMap`, `ES2022`, `NodeNext`, `src` → `dist`, single public entry, and no Angular/RxJS/runtime dependencies.

---

## Proposed Simplifications

### 1. `tsconfig.json` — remove options that are not required yet

Current:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "strict": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "**/*.spec.ts", "**/*.test.ts"]
}
```

Suggested:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022", "DOM"],
    "rootDir": "src",
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true,
    "strict": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Changes:
- **Remove `sourceMap: true`** — not required by the TODO. The TODO only requires `declarationMap`. Removing it reduces the number of emitted files and slightly speeds up the build.
- **Remove `removeComments: false`** — this is the default, so the explicit option has no effect.
- **Simplify `exclude`** to `["node_modules", "dist"]`. The test-file patterns are premature for an empty scaffold and can be re-added when tests are introduced.

Rationale: The scaffold has no runtime code, so source maps add no value today. The other two changes are cosmetic but reduce noise in the configuration.

---

### 2. `package.json` — remove optional metadata entry

Current:

```json
{
  "name": "@cobranza-apps/mfe-events",
  "version": "0.1.0",
  "description": "Typed event contracts and helpers for communication between the Cobranza Company Back-office Shell and its micro-frontends.",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/public-api.js",
  "module": "./dist/public-api.js",
  "types": "./dist/public-api.d.ts",
  "exports": {
    ".": {
      "types": "./dist/public-api.d.ts",
      "import": "./dist/public-api.js",
      "default": "./dist/public-api.js"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "README.md"
  ],
  "engines": {
    "node": ">=22.22.3"
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "rimraf": "^6.0.1"
  }
}
```

Suggested:

```json
{
  "name": "@cobranza-apps/mfe-events",
  "version": "0.1.0",
  "description": "Typed event contracts and helpers for communication between the Cobranza Company Back-office Shell and its micro-frontends.",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/public-api.js",
  "module": "./dist/public-api.js",
  "types": "./dist/public-api.d.ts",
  "exports": {
    ".": {
      "types": "./dist/public-api.d.ts",
      "import": "./dist/public-api.js",
      "default": "./dist/public-api.js"
    }
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=22.22.3"
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "rimraf": "^6.0.1"
  }
}
```

Changes:
- **Remove `exports["./package.json"]`** — not required by the TODO. It is useful for some tools but can be added later if a concrete consumer needs it.
- **Simplify `files` to `["dist"]`** — npm always includes `README.md`, `LICENSE`, and `package.json` automatically, so listing `README.md` is redundant.

Rationale: These fields are optional and the package works without them. Removing them tightens the published package manifest without losing the public entry point.

---

## What Was Deliberately NOT Simplified

The following items were considered but left as-is because changing them would violate the TODO or reduce future compatibility:

- **`src/index.ts` and `src/public-api.ts`** — The TODO explicitly asks for both files. Merging them into one would violate the requested layout.
- **Empty placeholder files (`events.ts`, `payloads.ts`, `types.ts`, `helpers.ts`)** — The TODO prefers empty modules over fake exports. They are already minimal.
- **`main`, `module`, `types`, and `exports["."]`** — Required for the single public entry point.
- **`declaration`, `declarationMap`, `strict`, `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `rootDir`, `outDir`** — Required by the TODO.
- **`lib: ["DOM"]`** — Not needed for the empty scaffold, but future event helpers will use DOM types (`CustomEvent`, `EventTarget`). Removing it now would only require adding it back later.
- **Extra strict flags beyond `strict: true`** — The TODO allows "as strict as sibling packages"; keeping them makes the project forward-compatible for real code.
- **`rimraf`** — Could be replaced by a Node built-in `fs.rmSync` script, but `rimraf` is a standard, cross-platform tool and the dependency is small. The trade-off is not clearly worth it.
- **`engines`** — Not required, but it aligns the package with the `.nvmrc` pin and is useful CI/tooling guard.

---

## Expected Verification After Applying

- `npm run typecheck` still exits 0.
- `npm run build` still produces `dist/public-api.js` and `dist/public-api.d.ts`.
- `npm run clean` still removes `dist/`.
- `.gitignore` remains unchanged (already covers `dist/` and `node_modules/`).
- No new dependencies are introduced; no existing dependencies are removed in the proposed changes.

---

## Conclusion

The only worthwhile simplifications are minor configuration cleanups in `tsconfig.json` and `package.json`. The source layout and overall package structure are already as simple as the TODO allows. If the project team prefers maximal forward compatibility, this plan can also be accepted as-is with no changes.