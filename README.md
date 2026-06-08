# Moon or Doom

Moon or Doom is a small BTC/USD guessing game. The player watches a live Bitcoin
price, guesses whether the next resolved move will go up or down, and scores
points based on the result.

You can see the app live at [https://moon-or-doom-eight.vercel.app/](https://moon-or-doom-eight.vercel.app)

The game goal, philosophy and rules are in [docs/VISION.MD](docs/VISION.MD).
Architecture and storage decisions are in [docs/ARCHITECTURE.MD](docs/ARCHITECTURE.MD) and in the [Architecture Decision Records (ADR)](docs/adr/README.MD).

## Get started

The app is a NestJS app with DynamoDB as data store.
Make sure to satisfy these requirements:

- Node.js `>=20.9.0`
- npm
- docker `>=29`

Then run

```bash
# Run the DynamoDB in isolation via Docker
docker compose up -d

# Setup environment variable
cp .example.env .env

# Install dependencies and run the app
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Quality checks

Commits run formatting, linting, and tests through Husky before they are accepted.

```bash
npm run format:check
npm run lint
npm test
```

## Production

Build and run the production server locally:

```bash
npm run build
npm run start
```

By default, `next start` serves the app on
[http://localhost:3000](http://localhost:3000).

## Docker

To run only the local DynamoDB database (default):

```bash
docker compose up
```

If you wish to run the app and database together via Docker:

```bash
docker compose --profile app up
```

To stop it all:

```bash
docker compose down
```
