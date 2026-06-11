# Architecture

## Tech Stack

| Layer          | Technology      | Version             |
| -------------- | --------------- | ------------------- |
| Frontend       | NextJS          | 16                  |
| Frontend       | React           | 19                  |
| Backend        | NextJS          | 16                  |
| Styling        | Tailwind        | 4                   |
| Crypto API     | Kraken          | -                   |
| Hosting        | Vercel          | -                   |
| Async queues   | Vercel Queues   | @vercel/queue       |
| Cloud services | AWS preferred   | -                   |
| Database       | Amazon DynamoDB | AWS managed service |
| ORM            | Dynamoose       | 4                   |
| AI             | Codex           | -                   |
| Unit tests     | Jest            | 30                  |

## Backend Persistence

AWS services are preferred for backend persistence. The current requirement is that each player's score should be persisted in a backend data store so returning players can continue from their existing score.

DynamoDB stores player profiles, materialized player scores, and resolved guess history. Guess records provide the audit trail for score changes, while the player profile stores the current score for fast reads.

Application repositories use Dynamoose models for player and guess reads, writes, queries, and transactions. The Dynamoose schemas mirror the created DynamoDB table keys, while table creation remains outside the request path.

## Backend Game Policy

Gameplay APIs follow a zero-trust policy for browser input. The frontend can send player intent, such as guess direction, but the backend owns the authoritative BTC/USD price capture, resolution timing, guess evaluation, and score mutation.

The backend must not accept client-supplied prices, results, score deltas, new scores, or resolution timestamps. See [ADR 0016](adr/0016-backend-zero-trust-game-policy.md).

## Background Queues

Vercel Queues handles Vercel-native asynchronous message processing. Producers
publish messages with the shared `send` queue helper, and push consumers process
messages with the shared `handleCallback` queue helper from route handlers
configured through `vercel.json`.

Queue consumers must be idempotent because messages can be delivered more than
once. Local queue testing requires `vercel link`, `vercel env pull`, and
`vercel dev`. See [ADR 0020](adr/0020-vercel-queues.md).
