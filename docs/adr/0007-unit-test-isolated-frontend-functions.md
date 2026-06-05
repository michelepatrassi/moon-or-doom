---
type: ADR
id: "0007"
title: "Unit test isolated frontend functions"
status: active
date: 2026-06-05
---

## Context

Moon or Doom has frontend logic that can be expressed as isolated functions, such as evaluating whether a guess wins against two prices. These functions are easier to test than UI flows and often contain the business rules that are most likely to regress during refactors.

Because isolated functions do not require rendering, browser APIs, or network state, testing them directly gives fast feedback with low setup cost.

## Decision

**Always add unit tests for isolated frontend functions.**

When frontend logic can be represented as a pure or isolated function, place the behavior in a small exported function and cover its meaningful branches with unit tests. Prefer direct function tests over component tests when the behavior does not depend on rendering.

## Options considered

- **Unit test isolated functions** (chosen): keeps business rules covered with fast, focused tests.
- **Only test through UI flows**: validates user behavior, but is slower and can make simple logic failures harder to diagnose.
- **Manual testing only**: may be acceptable for visual checks, but is too weak for deterministic business rules.

## Consequences

New or changed isolated frontend functions should include focused tests in the same area of the app. Tests should cover important branches and edge cases, not implementation details.

Component or end-to-end tests are still useful for integration behavior, but they do not replace unit coverage for reusable isolated logic.

If a function becomes hard to unit test, that is a signal to simplify its inputs, split responsibilities, or move side effects out of the core logic.
