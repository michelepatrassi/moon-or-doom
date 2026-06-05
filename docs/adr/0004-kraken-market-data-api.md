---
type: ADR
id: "0004"
title: "Use Kraken API for BTC/USD market data"
status: active
date: 2026-06-05
---

## Context

Moon or Doom needs live BTC/USD market data so a player can see the latest Bitcoin price and resolve each up-or-down guess after at least 60 seconds.

The market data integration should keep the application simple. For this project, avoiding API keys is valuable because an API key would introduce secret handling, server-side environment variables, and a backend proxy or server-only access pattern before the product needs that complexity.

The application also benefits from receiving price updates as events. A WebSocket feed is a better fit than repeatedly polling an HTTP endpoint because the UI depends on live price movement and should not introduce avoidable polling loops for standard gameplay.

## Decision

**Use Kraken's public API as the default source for BTC/USD market data, with Kraken WebSocket feeds preferred for live updates.**

Use Kraken public REST endpoints only where a one-off snapshot or recovery path is needed. Do not introduce authenticated Kraken endpoints, trading endpoints, API keys, or server-side secret configuration for the current market-data use case.

## Options considered

- **Kraken public API** (chosen): provides public market data without requiring a Kraken account or API key, supports unauthenticated WebSocket market data feeds, and allows the application to receive live BTC/USD updates without adding polling as the primary mechanism.
- **Binance public API**: provides public market-data WebSocket streams and remains a viable alternative, but it does not provide enough additional value for this product to justify choosing a different default provider or integrating multiple providers in the MVP.
- **CoinGecko API**: provides broad cryptocurrency market data and a free demo path, but the current API setup expects API key management for demo access and its WebSocket offering is not the same simple keyless public path. That adds setup and secret-handling concerns that are unnecessary for this project.

## Consequences

The initial integration can stay lightweight: live price updates can come from a browser-compatible WebSocket connection to a public market data feed, without adding application secrets or server-side environment variables.

The application becomes coupled to Kraken's market symbols, payload shape, connection behavior, rate limits, and availability. The implementation should isolate provider-specific mapping so future replacement or fallback remains possible.

WebSocket handling must account for connection drops, reconnect backoff, stale data, and initial loading states. A public REST snapshot may be useful as a recovery or initialization path, but periodic HTTP polling should not be the default live-data strategy.

This decision does not cover trading, user accounts, portfolio access, or private exchange data. Any authenticated exchange feature would require a new architecture decision because it would introduce secrets, server-side integration, and a different risk profile.

Re-evaluate this decision if Kraken changes public access terms, starts requiring API keys for the required market data, removes or materially limits public WebSocket feeds, proves unreliable for the gameplay loop, or if the product needs broader market coverage that Kraken cannot provide cleanly.

## References

- Kraken API Center: https://docs.kraken.com/api
- Kraken WebSocket API FAQ: https://support.kraken.com/en-de/articles/360022326871-kraken-websocket-api-frequently-asked-questions
- Kraken public REST endpoint examples: https://support.kraken.com/hc/articles/360000919986-Public-endpoint-examples-you-can-try-them-directly-in-a-web-browser-
- Binance Spot API docs: https://github.com/binance/binance-spot-api-docs
- CoinGecko API authentication docs: https://docs.coingecko.com/v3.0.1
- CoinGecko WebSocket docs: https://docs.coingecko.com/websocket/index
