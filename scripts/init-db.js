/* eslint-disable @typescript-eslint/no-require-imports */

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { loadEnvConfig } = require("@next/env");

const PLAYERS_TABLE_NAME = "players";

loadEnvConfig(process.cwd());

const client = new DynamoDB({
  endpoint: process.env.DYNAMODB_ENDPOINT,
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function createPlayersTable() {
  await client.createTable({
    TableName: PLAYERS_TABLE_NAME,
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
    BillingMode: "PAY_PER_REQUEST",
  });

  console.log(`Created DynamoDB table "${PLAYERS_TABLE_NAME}".`);
}

async function main() {
  try {
    await createPlayersTable();
  } catch (error) {
    if (error instanceof Error && error.name === "ResourceInUseException") {
      console.log(`DynamoDB table "${PLAYERS_TABLE_NAME}" already exists.`);
      return;
    }

    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
