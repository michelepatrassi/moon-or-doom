import { createDynamoDbDocument } from "../dynamodb";
import { Guess, GuessDirection, GuessKey, GuessStatus } from "./guess.types";

const TABLE_NAME = "guesses";

type GetGuessesInput = {
  status: GuessStatus;
  playerId?: string;
};

export async function getGuesses(input: GetGuessesInput): Promise<Guess[]> {
  const client = createDynamoDbDocument();

  if (!input.playerId) {
    // can be optimized with indexes on status, fine for prototyping
    const result = await client.scan({
      TableName: TABLE_NAME,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": input.status,
      },
    });

    return (result.Items as Guess[]) ?? [];
  }

  const result = await client.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: "playerId = :playerId",
    FilterExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":playerId": input.playerId,
      ":status": input.status,
    },
  });

  return (result.Items as Guess[]) ?? [];
}

type CreateGuessInput = {
  direction: GuessDirection;
  playerId: string;
  entryPrice: number;
  status: GuessStatus;
  resolvesAfter: Date;
};

export async function createGuess(input: CreateGuessInput) {
  const { playerId, direction, entryPrice, status, resolvesAfter } = input;

  const client = createDynamoDbDocument();
  const now = new Date();
  const guess: Guess = {
    id: crypto.randomUUID(),
    playerId,
    direction,
    entryPrice,
    status,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    resolvesAfter: resolvesAfter.toISOString(),
  };

  await client.put({
    TableName: TABLE_NAME,
    Item: guess,
  });

  return guess;
}

export async function updateGuess(
  key: GuessKey,
  values: Pick<Guess, "resolvedAt" | "resolvedPrice" | "status">
): Promise<void> {
  const client = createDynamoDbDocument();

  const now = new Date().toISOString();

  await client.update({
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression:
      "SET #resolvedAt = :resolvedAt, #resolvedPrice = :resolvedPrice, #updatedAt = :updatedAt, #status = :status",
    ExpressionAttributeNames: {
      "#resolvedAt": "resolvedAt",
      "#resolvedPrice": "resolvedPrice",
      "#updatedAt": "updatedAt",
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":resolvedAt": values.resolvedAt,
      ":resolvedPrice": values.resolvedPrice,
      ":updatedAt": now,
      ":status": values.status,
    },
  });
}

export async function getGuess(input: GuessKey) {
  const client = createDynamoDbDocument();

  const result = await client.get({
    TableName: TABLE_NAME,
    Key: input,
  });

  return result.Item as Guess | undefined;
}
