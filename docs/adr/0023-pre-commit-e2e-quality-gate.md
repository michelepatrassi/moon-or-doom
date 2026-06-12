---
type: ADR
id: "0023"
title: "Pre-commit E2E quality gate"
status: active
date: 2026-06-12
supersedes: "0012"
---

## Context

The project now has Playwright end-to-end coverage for the main frontend flow.
The existing Husky pre-commit gate runs formatting, linting, and Jest unit
tests, but it can still accept commits that break the browser-level flow.

Because the Playwright tests mock app APIs and the Kraken ticker WebSocket, they
can run locally without DynamoDB, queues, cron jobs, or external market data.

## Decision

**Run Playwright E2E tests in the Husky pre-commit quality gate after the unit
test suite.**

The hook runs `npm run format:check`, `npm run lint`,
`npm test -- --runInBand`, and `npm run test:e2e` before Git accepts a commit.

## Options considered

- **Run E2E in pre-commit** (chosen): catches broken browser flows before the
  commit is created and keeps the quality gate local.
- **Run E2E manually only**: keeps commits faster, but makes browser-flow
  regressions easier to miss.
- **Run E2E only in CI**: protects shared branches, but delays feedback until
  after a commit is already made.

## Consequences

Commits take longer because the Playwright suite starts or reuses a local Next.js
dev server and runs Chromium.

Developers need the Playwright Chromium browser installed locally once with
`npx playwright install chromium`.

If E2E coverage grows enough to make commits too slow, the gate should be
re-evaluated and some browser tests may move to CI-only execution.
