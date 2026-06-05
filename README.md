# Moon or Doom

Moon or Doom is a small BTC/USD guessing game. The player watches a live Bitcoin
price, guesses whether the next resolved move will go up or down, and scores
points based on the result.

Detailed game rules are in [docs/VISION.MD](docs/VISION.MD). Architecture and
storage decisions are in [docs/ARCHITECTURE.MD](docs/ARCHITECTURE.MD) and the
[ADR index](docs/adr/README.MD).

## Setup

Requirements:

- Node.js `>=20.9.0`
- npm

```bash
npm install
```

No environment variables are required. The current app reads live BTC/USD prices
from Kraken's public WebSocket ticker feed.

## Run Locally

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```bash
npm test
npm run lint
```

## Production

Build and run the production server locally:

```bash
npm run build
npm run start
```

By default, `next start` serves the app on
[http://localhost:3000](http://localhost:3000).
