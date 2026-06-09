---
type: ADR
id: "0015"
title: "Use a dedicated DynamoDB guesses table"
status: active
date: 2026-06-08
---

## Context

Moon or Doom now creates backend-owned guesses before resolving them. Each guess
belongs to one player, but guesses grow as gameplay history while the player
profile should stay small and quick to read.

## Decision

**Store guesses as separate items in a dedicated DynamoDB `guesses` table.**

The player profile remains in the `players` table with the current score. Guess
items are keyed by `playerId` and `id`, and contain only the fields needed for
creation and later resolution.

## Options considered

- **Dedicated `guesses` table** (chosen): keeps player records small and keeps
  guess lifecycle code separate from player profile reads.
- **Nested guesses on the player item**: simple at first, but makes the player
  item grow without bound and complicates resolution retries.
- **Single-table design**: viable later, but adds key-shape complexity that is
  unnecessary for the current app.

## Consequences

Creating and resolving guesses can evolve independently from loading the player
profile. Reads that need both player and guess data will make explicit calls to
both tables.
