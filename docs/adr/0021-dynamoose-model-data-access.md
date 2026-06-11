---
type: ADR
id: "0021"
title: "Dynamoose model data access"
status: active
date: 2026-06-11
supersedes: "0014"
---

## Context

The app stores players and guesses in DynamoDB. Earlier data modules used AWS
SDK document-client convenience methods directly, which was simpler than raw
attribute-value objects but still pushed DynamoDB expression syntax into
application repositories.

That syntax becomes awkward as records gain optional fields. Updating a player
or guess requires assembling update expressions, attribute names, and attribute
values even when the app only wants to set whichever optional fields are present.

## Decision

**Use Dynamoose as the TypeScript-native model layer for application DynamoDB
access.**

Player and guess repositories should interact with DynamoDB through Dynamoose
models and schemas.

Raw AWS SDK access can still be used for infrastructure-level setup or health
checks, but application create, read, query, and update operations should go
through Dynamoose models.

## Options considered

- **Dynamoose models** (chosen): provides TypeScript-friendly model APIs,
  explicit schemas, flexible optional-field updates, query/scan helpers, and
  transaction helpers without hand-written update expressions in app code.
- **AWS SDK document-client convenience methods**: keeps dependencies smaller,
  but still requires manual DynamoDB expressions for updates and filters.
- **Custom repository helpers over the AWS SDK**: could hide some expression
  syntax, but would recreate ORM-like behavior locally without gaining the
  schema and transaction API Dynamoose already provides.

## Consequences

Repositories should define and use Dynamoose models for persisted application
items. Player and guess model files are the source of truth for field optionality
and table keys.

Application updates can pass partial objects to Dynamoose instead of manually
building expression strings for every combination of optional fields.

The app adds a runtime dependency on `dynamoose`. Future schema changes must
keep the Dynamoose model definitions aligned with the manually provisioned
DynamoDB tables.

Dynamoose automatic table creation and table updates should stay disabled in
application code because production tables are created deliberately outside the
request path.
