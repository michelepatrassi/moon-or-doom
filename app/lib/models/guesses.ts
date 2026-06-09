import { COUNTDOWN } from "../../constant";
import type { GuessDirection } from "../../types";
import { createDynamoDbDocument } from "../dynamodb";

const TABLE_NAME = "guesses";

export type GuessStatus = "pending" | "resolved";

export type Guess = {
  id: string;
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
  status: GuessStatus;
  createdAt: string;
  resolvesAt: string;
};

type CreateGuessInput = {
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
};

export async function getPendingGuess(playerId: string): Promise<Guess | null> {
  const client = createDynamoDbDocument();
  const result = await client.query({
    TableName: TABLE_NAME,
    KeyConditionExpression: "playerId = :playerId",
    FilterExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":playerId": playerId,
      ":status": "pending",
    },
    Limit: 1,
  });

  return (result.Items?.[0] as Guess | undefined) ?? null;
}

export async function createGuess({
  playerId,
  direction,
  entryPrice,
}: CreateGuessInput): Promise<Guess> {
  const client = createDynamoDbDocument();
  const createdAt = new Date();
  const guess: Guess = {
    id: crypto.randomUUID(),
    playerId,
    direction,
    entryPrice,
    status: "pending",
    createdAt: createdAt.toISOString(),
    resolvesAt: new Date(createdAt.getTime() + COUNTDOWN * 1000).toISOString(),
  };

  await client.put({
    TableName: TABLE_NAME,
    Item: guess,
  });

  return guess;
}

// can be optimized with indexes on status, fine for prototyping
export async function getPendingGuesses(): Promise<Guess[]> {
  const client = createDynamoDbDocument();

  const result = await client.scan({
    TableName: TABLE_NAME,
    FilterExpression: "#status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": "pending",
    },
  });

  return (result.Items as Guess[]) ?? [];
}

export async function updateGuess(guess: Guess): Promise<void> {
  const client = createDynamoDbDocument();

  await client.update({
    TableName: TABLE_NAME,
    Key: {
      id: guess.id,
      playerId: guess.playerId,
    },
    UpdateExpression: "SET #status = :status",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": guess.status,
    },
  });
}
