# Moon or Doom

Moon or Doom is a small BTC/USD guessing game. The player watches a live Bitcoin
price, guesses whether the next resolved move will go up or down, and scores
points based on the result.

You can see the app live at [https://moon-or-doom-eight.vercel.app/](https://moon-or-doom-eight.vercel.app)

The game goal, philosophy and rules are in [docs/VISION.MD](docs/VISION.MD).
Architecture and storage decisions are in [docs/ARCHITECTURE.MD](docs/ARCHITECTURE.MD) and in the [Architecture Decision Records (ADR)](docs/adr/README.MD).

## Get started

The app is a Next.js app with DynamoDB as data store.
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

# Install dependencies
npm install

# Initialize the local DynamoDB tables
npm run db:setup

# Run the app
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

## Deployment

The app is deployed on Vercel. To deploy a new version, push your latest code changes to main. They will be released in a couple of minutes.

### If you want to deploy this yourself

Host the app in any provider which supports nodejs, such as Vercel.

The DynamoDB database should be initialized manually in AWS once. Make sure it contains a `players` table as done programmatically in `scripts/init-db.js`.

Environment variables needs to be configured in your hosting provider. It should include the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` pair from the previously configured database, together with the remaining variables in `.example.env`.

Once configured, you can build and run the app:

```bash
npm install
npm run build
npm run start
```

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

To cleanup the database

```bash
docker compose down -v
```
