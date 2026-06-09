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
| Cloud services | AWS preferred   | -                   |
| Database       | Amazon DynamoDB | AWS managed service |
| AI             | Codex           | -                   |
| Unit tests     | Jest            | 30                  |

## Backend Persistence

AWS services are preferred for backend persistence. The current requirement is that each player's score should be persisted in a backend data store so returning players can continue from their existing score.

DynamoDB stores player profiles, materialized player scores, and resolved guess history. Guess records provide the audit trail for score changes, while the player profile stores the current score for fast reads.

## Backend Game Policy

Gameplay APIs follow a zero-trust policy for browser input. The frontend can send player intent, such as guess direction, but the backend owns the authoritative BTC/USD price capture, resolution timing, guess evaluation, and score mutation.

The backend must not accept client-supplied prices, results, score deltas, new scores, or resolution timestamps. See [ADR 0016](adr/0016-backend-zero-trust-game-policy.md).
