---
type: ADR
id: "0006"
title: "Use named const declarations for React components"
status: active
date: 2026-06-05
---

## Context

Moon or Doom has several React components across route files and reusable UI files. Mixing anonymous default exports, function declarations, and named exports makes component names less consistent across imports, stack traces, DevTools, and code review.

A single declaration pattern makes components easier to scan and keeps imported names standardized across the app.

## Decision

**Declare React components as named `const` values and export those names. Avoid generic default component declarations.**

Reusable components should use named exports, for example `export const Ticker = (...) => { ... }`, and consumers should import them by name. Next.js route convention files such as `page.tsx` and `layout.tsx` may still use the framework-required default export, but the component itself should be declared first as a named `const`, then exported as the default.

## Options considered

- **Named const components** (chosen): standardizes component declarations and imports while keeping component names explicit.
- **Default function declarations**: concise, but allows inconsistent import names and weakens app-wide naming conventions.
- **Mixed declaration styles**: flexible, but makes the codebase less predictable as it grows.

## Consequences

New reusable components should not be introduced as anonymous or default-only exports. Prefer direct named imports over choosing arbitrary local names for default imports.

Route files must still satisfy Next.js file-convention exports. In those files, use a named `const` component and `export default ComponentName` to preserve both framework compatibility and naming consistency.

This rule is about component declaration style only. Non-component helpers, hooks, constants, metadata, and framework-required exports should follow the pattern that best fits their API.
