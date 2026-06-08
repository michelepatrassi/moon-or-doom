---
type: ADR
id: "0011"
title: "Use AWS SDK DynamoDB client"
status: active
date: 2026-06-05
---

## Context

ADR 0010 chose DynamoDB for player score persistence. The application now needs
a client library for reading and writing DynamoDB records from server-side
Next.js code.

## Decision

**Use `@aws-sdk/client-dynamodb` for server-side DynamoDB access.**

Create and use DynamoDB clients only in server-side code. Browser code should
call application routes or server actions rather than accessing DynamoDB
directly.

## Options considered

- **Raw signed HTTP requests**: avoids a dependency, but reimplements AWS
  signing and would make even simple persistence code unnecessarily fragile.

## Consequences

Database access stays behind the application server boundary, keeping AWS
configuration and credentials out of client-side bundles.
