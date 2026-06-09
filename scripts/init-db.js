/* eslint-disable @typescript-eslint/no-require-imports */

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { loadEnvConfig } = require("@next/env");

const PLAYERS_TABLE_NAME = "players";
const GUESSES_TABLE_NAME = "guesses";

loadEnvConfig(process.cwd());

const client = new DynamoDB({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function createTable(tableName, tableConfig) {
  await client.createTable({
    TableName: tableName,
    ...tableConfig,
    BillingMode: "PAY_PER_REQUEST",
  });

  console.log(`Created DynamoDB table "${tableName}".`);
}

async function createTableIfMissing(tableName, tableConfig) {
  try {
    await createTable(tableName, tableConfig);
  } catch (error) {
    if (error instanceof Error && error.name === "ResourceInUseException") {
      console.log(`DynamoDB table "${tableName}" already exists.`);
      return;
    }

    throw error;
  }
}

async function createPlayersTable() {
  await createTableIfMissing(PLAYERS_TABLE_NAME, {
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
  });
}

async function createGuessesTable() {
  await createTableIfMissing(GUESSES_TABLE_NAME, {
    AttributeDefinitions: [
      {
        AttributeName: "playerId",
        AttributeType: "S",
      },
      {
        AttributeName: "id",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "playerId",
        KeyType: "HASH",
      },
      {
        AttributeName: "id",
        KeyType: "RANGE",
      },
    ],
  });
}

async function main() {
  await createPlayersTable();
  await createGuessesTable();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
