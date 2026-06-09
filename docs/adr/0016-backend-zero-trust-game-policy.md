---
type: ADR
id: "0016"
title: "Use a backend zero-trust game policy"
status: active
date: 2026-06-08
---

## Context

Moon or Doom accepts gameplay input from a browser client. The client can be
modified, replay requests, send stale prices, or submit fields the UI would not
normally expose.

The game stays fair only if the backend treats client requests as intent, not as
facts about the market, timing, result, or score.

## Decision

**Use a backend zero-trust policy for gameplay APIs.**

The client may send intent such as guess direction. The backend must own
authoritative game facts, including the BTC/USD price when a guess is created,
the time when a guess can resolve, the BTC/USD price used for resolution, the
guess result, and the player score mutation.

## Options considered

- **Backend zero-trust policy** (chosen): keeps price capture, timing,
  evaluation, and score updates server-side where requests can be validated and
  retried safely.
- **Client-assisted evaluation**: lets the client send observed prices or
  computed results, but makes score changes dependent on untrusted input.
- **Frontend-only gameplay state**: simple for prototypes, but does not support
  persisted scores or fair resolution.

## Consequences

Gameplay API handlers must ignore client-supplied prices, results, score deltas,
new scores, and resolution timestamps.

When a guess is created, the backend fetches the current BTC/USD price and stores
it with the guess. When a guess is resolved, the backend fetches the resolution
price, evaluates the stored guess, and updates the player score.

Resolution must be idempotent so repeated client requests cannot apply the same
score change more than once.
