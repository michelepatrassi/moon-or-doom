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
  resolvesAt: Date;
};

export async function createGuess(input: CreateGuessInput) {
  const { playerId, direction, entryPrice, status, resolvesAt } = input;

  const client = createDynamoDbDocument();
  const createdAt = new Date();
  const guess: Guess = {
    id: crypto.randomUUID(),
    playerId,
    direction,
    entryPrice,
    status,
    createdAt: createdAt.toISOString(),
    resolvesAt: resolvesAt.toISOString(),
  };

  await client.put({
    TableName: TABLE_NAME,
    Item: guess,
  });

  return guess;
}

export async function updateGuess(
  key: GuessKey,
  values: Pick<Guess, "status">
): Promise<void> {
  const client = createDynamoDbDocument();

  await client.update({
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression: "SET #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
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
