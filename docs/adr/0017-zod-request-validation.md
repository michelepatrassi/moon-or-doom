---
type: ADR
id: "0017"
title: "Use Zod for request validation"
status: active
date: 2026-06-08
---

## Context

Gameplay APIs receive JSON from the browser. The backend zero-trust policy
requires those payloads to be validated before application logic uses them.

Manual `unknown` checks work for tiny payloads, but they spread validation rules
across route handlers and make it harder to see the exact request contract.

## Decision

**Use Zod schemas to validate backend request bodies.**

Route handlers should define a schema near the boundary, infer the request body
type from that schema, and use the parsed value after validation.

## Options considered

- **Zod** (chosen): keeps runtime validation and TypeScript inference together
  in a small, common library.
- **Manual type guards**: avoids a dependency, but duplicates shape checks and
  type definitions as request bodies grow.
- **TypeScript-only request types**: documents intent at compile time, but does
  not validate untrusted JSON at runtime.

## Consequences

Backend API request contracts should be expressed as Zod schemas. Gameplay
schemas should be strict when the backend must reject client-supplied fields that
are not part of the contract.
