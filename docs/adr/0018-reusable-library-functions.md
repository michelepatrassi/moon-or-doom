---
type: ADR
id: "0018"
title: "Prefer reusable library functions"
status: active
date: 2026-06-08
---

## Context

Modules under `app/lib/` are library-style backend helpers. They are easier to
test and reuse when they receive variable inputs as parameters instead of closing
over app-specific constants.

For example, market-data helpers should accept the requested ticker instead of
hardcoding the current app ticker inside the helper.

## Decision

**Library functions should be reusable by taking their meaningful inputs as
parameters.**

Application routes, hooks, or components can import app-level constants and pass
them into library functions. Library modules should keep provider-specific
details hidden while exposing small, input-driven functions.

## Options considered

- **Input-driven library functions** (chosen): keeps helpers reusable, easier to
  unit test, and less coupled to one route or screen.
- **Helpers that import app constants directly**: shorter at first, but couples
  shared code to one use case and makes later reuse harder.
- **Generic abstraction layer**: can help once multiple providers or repeated
  patterns exist, but is more structure than the current app needs.

## Consequences

When adding functions in `app/lib/`, prefer signatures like
`getCurrentPrice(ticker)` over hardcoded helpers like
`getCurrentBtcUsdPrice()`.

Keep the public function simple and domain-oriented. Hide provider-specific
mapping, URL construction, and response parsing inside the library module.
