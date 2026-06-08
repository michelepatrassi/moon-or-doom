---
type: ADR
id: "0013"
title: "Use DynamoDB document client for data access"
status: active
date: 2026-06-08
supersedes: "0011"
---

## Context

ADR 0011 established the AWS SDK as the server-side DynamoDB access path. As
the app starts writing real player records, using the low-level DynamoDB
attribute-value shape would force application code to handle values such as
`{ S: id }` and `{ N: "0" }`.

The project needs typed, readable persistence functions for player profiles,
scores, and future guess history. Michele specifically wants
`@aws-sdk/lib-dynamodb` because it makes working with typed data easier.

## Decision

**Use `@aws-sdk/lib-dynamodb` for application data access, backed by the
low-level `@aws-sdk/client-dynamodb` client.**

Server-side DynamoDB modules should use `DynamoDBDocumentClient` and document
commands such as `GetCommand`, `PutCommand`, `UpdateCommand`, and
`TransactWriteCommand` when reading or writing application items.

The low-level DynamoDB client remains the transport layer and can still be used
for infrastructure-level operations that do not work with application item
data, such as connectivity checks.

## Options considered

- **DynamoDB document client** (chosen): lets persistence code use ordinary
  JavaScript values such as `{ id, score: 0 }`, improves TypeScript ergonomics,
  and keeps DynamoDB attribute-value marshalling out of application modules.
- **Low-level DynamoDB client only**: keeps one fewer dependency, but makes
  every read/write noisier and easier to type incorrectly.
- **Custom marshalling helpers**: avoids the document client dependency, but
  duplicates behavior the AWS SDK already provides.

## Consequences

Persistence modules should not manually construct DynamoDB attribute values for
application data. Avoid `{ S: ... }`, `{ N: ... }`, and similar low-level
shapes outside infrastructure-only code.

The shared DynamoDB library should expose both the raw client and the document
client. Application data modules should import the document client helper.

Future player profile and guess-history writes can use document commands and
plain typed objects, while still relying on the AWS SDK's supported DynamoDB
client underneath.
