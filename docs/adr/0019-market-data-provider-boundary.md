---
type: ADR
id: "0019"
title: "Separate market data provider adapters"
status: active
date: 2026-06-09
---

## Context

Moon or Doom currently uses Kraken for market data, but the app should keep
gameplay code separate from provider-specific URL construction, symbol mapping,
and response parsing.

ADR 0004 already notes that provider-specific mapping should be isolated so the
market data provider can be replaced later.

## Decision

**Separate provider-specific market data integrations from the app-facing market
data interface.**

Gameplay and domain code should depend on market-data concepts such as "current
price for this ticker", not on exchange-specific endpoints, symbols, payloads, or
HTTP details. Provider adapters should own URL construction, provider-specific
symbol mapping, request execution, error interpretation, and response parsing.

## Options considered

- **Provider adapter behind an app-facing market-data interface** (chosen): keeps
  gameplay code stable and makes provider replacement a local change.
- **Direct provider calls from gameplay code**: simple, but spreads
  provider-specific details into code that should only care about game behavior.
- **Full provider registry**: useful once multiple providers are active, but more
  structure than the app needs today.

## Consequences

New provider integrations should be added behind the same market-data boundary.
Changing provider-specific endpoints, symbols, or payload parsing should not
require changing gameplay route logic.
