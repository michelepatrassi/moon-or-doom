---
type: ADR
id: "0005"
title: "Follow KISS for code simplicity"
status: active
date: 2026-06-05
---

## Context

Moon or Doom is a small product whose code should stay easy to read, change, and debug. Premature abstractions, defensive state shapes, and optimization patterns can make simple behavior harder to understand before the application has enough complexity to justify them.

The project benefits from code that communicates intent directly. A future maintainer should be able to read a component, hook, or service and understand the state, data flow, and side effects without first unpacking unnecessary indirection.

## Decision

**Follow KISS: keep code as simple and readable as possible, and add optimization or abstraction only when there is a concrete need.**

Prefer straightforward state, props, functions, and data flow. Use memoization, callback stabilization, derived caches, shared abstractions, or other optimization patterns only when they solve an observed or well-justified performance, correctness, or duplication problem.

## Options considered

- **KISS-first implementation** (chosen): keeps the default implementation direct and readable, while still allowing optimization when evidence or clear constraints require it.
- **Optimization-first implementation**: may reduce some future work, but makes current code harder to reason about and can add complexity for problems that may never appear.
- **Abstraction-first implementation**: can help when patterns are proven and repeated, but risks hiding behavior behind generic layers before the product needs them.

## Consequences

Code reviews should prefer simple, explicit implementations over clever or overly defensive ones. If a component only needs one piece of state, it should not carry a broader state model just in case. If a calculation is cheap, it should not be memoized by default.

When adding memoization, complex effects, shared helpers, or new abstractions, the change should explain what problem is being solved. Acceptable reasons include measured slow renders, expensive recomputation, unstable callbacks causing real rerender issues, meaningful duplication, or a cross-cutting behavior that is already repeated.

This decision does not forbid optimization. It sets simplicity as the default and requires complexity to earn its place.

Re-evaluate this decision only if the application grows enough that stricter architecture patterns become necessary for maintainability.
