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
