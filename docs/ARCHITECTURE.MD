# Architecture

## Main Application flow

When a player makes an UP or DOWN guess, it gets stored in the database and queued for resolution.

The resolution happens asynchronously in the backend. When a guess is due, the frontend starts polling the backend to check if the resolution has happened.

## Data model

There are 2 main tables: `players` and `guesses`.

The `players` table stores the player data, such as the score.

The `guesses` table stores all the guesses made in the app. These are initially stored with a snapshot of the state when a guess is made (e.g. ticker price, due date), and they are later updated with the evaluation result. It is important to store the result of the guess instead of evaluating it at runtime, as the rules of the game can change. This approach allows auditing the player score at any time. No cheating! 🙅

## Zero trust policy

The frontend sends player intent in the form of guess direction, but the backend owns the authoritative ticker price capture, resolution timing, guess evaluation, and score mutation.

The backend does not accept client-supplied prices, results, score deltas, new scores, or resolution timestamps. See [ADR 0016](adr/0016-backend-zero-trust-game-policy.md).

## Guess resolution

Every guess is queued for its due date for resolution. This approach ensures the guess is resolved fairly and asynchronously from the client. If after the due date the guess cannot be resolved, it gets queued again at an optimistic time.

Queues are implemented with Vercel Queues. See [ADR 0020](adr/0020-vercel-queues.md).

## Tech Stack

| Layer        | Technology      | Version             |
| ------------ | --------------- | ------------------- |
| Frontend     | NextJS          | 16                  |
| Frontend     | React           | 19                  |
| Backend      | NextJS          | 16                  |
| Styling      | Tailwind        | 4                   |
| Crypto API   | Kraken          | -                   |
| Hosting      | Vercel          | -                   |
| Async queues | Vercel Queues   | @vercel/queue       |
| Database     | Amazon DynamoDB | AWS managed service |
| ORM          | Dynamoose       | 4                   |
| Unit tests   | Jest            | 30                  |
