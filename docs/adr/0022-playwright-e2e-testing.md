---
type: ADR
id: "0022"
title: "Playwright E2E testing"
status: active
date: 2026-06-12
---

## Context

Moon or Doom has frontend flows that depend on browser behavior, API calls, and
the Kraken ticker WebSocket. Jest covers isolated units well, but it does not
exercise the app as a user sees it in a real browser.

End-to-end coverage should be added gradually so the first tests stay reliable
and do not require DynamoDB, queues, cron jobs, or external market data.

## Decision

**Use Playwright for browser-level end-to-end tests, with app APIs and external
ticker data mocked at the test boundary.**

Tests should live under `e2e/`, use the Playwright `webServer` config for the
Next.js dev server, and install deterministic route/WebSocket mocks before
navigating to the app.

## Options considered

- **Playwright** (chosen): provides real browser coverage, network mocking, and
  a standard Next.js setup path with a small dependency footprint.
- **Cypress**: also provides browser coverage, but adds a larger runner surface
  and a separate interaction model.
- **Jest and Testing Library only**: keeps feedback fast, but cannot validate
  browser integration with the real Next.js page.

## Consequences

The app adds `@playwright/test` as a dev dependency and a `test:e2e` script.

E2E tests should mock app API routes and external browser APIs unless a future
test explicitly needs a full backend integration path. Unhandled app API calls
should fail loudly so tests do not accidentally depend on local DynamoDB or
external services.

The first Playwright project targets Chromium only. Additional browsers can be
added when the covered flows justify the extra runtime and maintenance cost.
