---
type: ADR
id: "0012"
title: "Husky and Prettier pre-commit quality gate"
status: active
date: 2026-06-08
---

## Context

Commits should not accept code that is unformatted, fails lint rules, or breaks the automated test suite. The project already uses npm scripts for linting and Jest tests, but those checks currently depend on developers remembering to run them before committing.

## Decision

**Use Husky to run a pre-commit quality gate, and use Prettier as the project formatter.** The hook runs `npm run format:check`, `npm run lint`, and `npm test -- --runInBand` before Git accepts a commit.

## Options considered

- **Husky and Prettier** (chosen): keeps the quality gate local to Git commits and adds an explicit formatting standard with npm scripts.
- **npm scripts only**: keeps dependencies lower, but still allows commits when checks are forgotten.
- **CI-only enforcement**: protects shared branches, but catches formatting and test failures after the local commit is already created.

## Consequences

Developers get immediate feedback before committing. Commits take longer because the full lint and Jest test suite run locally, and formatting failures must be fixed with `npm run format` before retrying.
