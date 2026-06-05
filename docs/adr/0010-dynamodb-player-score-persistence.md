---
type: ADR
id: "0010"
title: "Use DynamoDB for player score persistence"
status: active
date: 2026-05-29
---

## Context

Moon or Doom now needs backend persistence for player state. The current requirement is that the score of each player should be persisted in a backend data store so a player can close the browser, return later, and continue with the same score.

AWS services are preferred for backend infrastructure decisions in this project. The storage choice should keep the application simple while supporting player profiles, resolved guess history, and fast score reads for the game UI.

The score can be derived from the full guess history, but the UI needs the current score frequently. Recomputing it from every stored guess on each read would add unnecessary query cost and latency as player history grows.

## Decision

**Use Amazon DynamoDB as the backend data store for persisted player profiles, player scores, and guess history.**

Store the current score on the player profile as a materialized value, and store each resolved guess as an append-only history record. The guess history explains how the score was reached and can be used to rebuild the score if needed.

For local development, use DynamoDB Local rather than introducing a different local-only database.

## Options considered

- **Amazon DynamoDB** (chosen): fits the AWS preference, has low operational overhead, supports simple key-value access patterns for player profiles and guess history, supports local development through DynamoDB Local, and can update profile score and guess records atomically when needed.
- **PostgreSQL on Amazon RDS or Aurora**: provides SQL, relational constraints, and strong ad hoc querying, but adds relational database setup, connection management, and more operational weight than the current game requirements need.
- **MongoDB-compatible storage with Amazon DocumentDB**: supports a document-oriented model, but does not provide enough benefit for the current access patterns to justify choosing it over DynamoDB.
- **Browser-only local storage**: simple for a prototype, but does not satisfy the requirement that player scores are persisted in a backend data store.

## Consequences

The application should model persistence around player-centric access patterns, such as loading a player profile, reading the current score, appending a resolved guess, and optionally listing a player's guess history.

The player profile should store the current score for fast UI reads. Guess records should store the direction, snapshot price, resolution price, result, score delta, and timestamps so score changes remain auditable.

When a guess resolves, the backend should avoid double-scoring retries. Use an idempotent guess identifier and a conditional or transactional write so the resolved guess is stored once and the player score is updated once.

DynamoDB does not support relational joins. Future features that need broad analytics, complex relational reporting, or rich admin querying may require exports, secondary indexes, or a separate analytics-oriented store.

Leaderboards or cross-player score queries will need an explicit access pattern, likely a secondary index or a purpose-built leaderboard projection.

Re-evaluate this decision if the product needs complex relational reporting, if player identity requirements require a different user-management architecture, or if AWS services stop being the preferred infrastructure direction.

## References

- Amazon DynamoDB overview: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html
- DynamoDB Local: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html
- DynamoDB transactions: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html
- DynamoDB atomic counters: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/example_dynamodb_Scenario_AtomicCounterOperations_section.html
