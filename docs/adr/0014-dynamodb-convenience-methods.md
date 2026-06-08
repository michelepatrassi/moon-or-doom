---
type: ADR
id: "0014"
title: "Use DynamoDB convenience methods"
status: active
date: 2026-06-08
supersedes: "0013"
---

## Context

ADR 0013 chose `@aws-sdk/lib-dynamodb` so application data modules can work
with typed JavaScript values instead of low-level DynamoDB attribute-value
objects.

The AWS SDK also exposes two usage styles: constructing command objects and
calling `client.send(new Command(...))`, or using the convenience clients that
provide operation methods directly. Michele prefers the latter because
`client.get(...)`, `client.put(...)`, and similar methods are simpler to read
and keep the data-access code focused on the item shape.

## Decision

**Use `DynamoDB` and `DynamoDBDocument` convenience clients and prefer direct
operation methods over `client.send(new Command(...))`.**

Raw DynamoDB infrastructure code should use `DynamoDB` from
`@aws-sdk/client-dynamodb`. Application data modules should use
`DynamoDBDocument` from `@aws-sdk/lib-dynamodb`.

## Options considered

- **Convenience clients and direct methods** (chosen): keeps persistence code
  short and lets data modules call `get`, `put`, `update`, and similar methods
  directly with typed JavaScript values.
- **Command objects with `.send(...)`**: supported by the AWS SDK, but adds
  boilerplate that is not useful for this app's current persistence layer.
- **Low-level DynamoDB attribute values**: exposes DynamoDB marshalling details
  such as `{ S: ... }` and `{ N: ... }`, which the project has decided to avoid
  for application data access.

## Consequences

Backend modules should not import `GetCommand`, `PutCommand`,
`UpdateCommand`, or similar command classes for ordinary DynamoDB application
data operations.

The shared DynamoDB helper should expose a raw `DynamoDB` client and a
`DynamoDBDocument` client. Player and guess persistence modules should call the
document client's convenience methods.
