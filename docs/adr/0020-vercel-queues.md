---
type: ADR
id: "0020"
title: "Vercel Queues for asynchronous work"
status: active
date: 2026-06-10
---

## Context

Moon or Doom is deployed on Vercel and already uses Next.js route handlers for
server-side application behavior. Some work can be decoupled from the user-facing
request path and processed asynchronously.

Vercel Queues provides a managed topic and consumer model that integrates with
Vercel Functions, OIDC authentication, local `vercel dev`, and `vercel.json`
function triggers. The initial integration uses the `orders` topic and a
`fulfill-order` consumer route to establish the producer/consumer pattern.

## Decision

**Use Vercel Queues via `@vercel/queue` for Vercel-native asynchronous message
processing.**

Server-side producers should publish messages with the shared `send` queue
helper. Push consumers should use the shared `handleCallback` queue helper from
Next.js route handlers and be wired to topics through `vercel.json` queue
triggers.

## Options considered

- **Vercel Queues with `@vercel/queue`** (chosen): fits the current Vercel
  deployment target, uses OIDC instead of app-managed queue credentials, and
  supports local testing through `vercel dev`.
- **Synchronous route handling**: keeps the stack smaller, but couples background
  work to user-facing request latency and failure handling.
- **AWS queue service**: aligns with the AWS preference for durable backend
  storage, but adds separate infrastructure and credentials for this Vercel
  route-triggered workflow.

## Consequences

Queue consumers must be idempotent because queue delivery is at least once and
failed handlers can be retried.

Local development requires a linked Vercel project and pulled OIDC environment
variables. The shared queue client should use Vercel's `VERCEL_REGION` value
when available and fall back to `iad1` locally. Developers should run
`vercel link`, `vercel env pull`, and `vercel dev` when testing
producer/consumer behavior locally.

The Vercel queue trigger configuration belongs in `vercel.json`, next to other
platform-level scheduling and invocation configuration.
