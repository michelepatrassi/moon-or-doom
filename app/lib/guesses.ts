import { COUNTDOWN } from "../constant";
import type { GuessDirection } from "../types";
import { createDynamoDbDocument } from "./dynamodb";

const TABLE_NAME = "guesses";

export type StoredGuess = {
  id: string;
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
  status: "pending";
  createdAt: string;
  resolvesAt: string;
};

type CreateGuessInput = {
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
};

export async function getPendingGuess(
  playerId: string
): Promise<StoredGuess | null> {
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

  return (result.Items?.[0] as StoredGuess | undefined) ?? null;
}

export async function createGuess({
  playerId,
  direction,
  entryPrice,
}: CreateGuessInput): Promise<StoredGuess> {
  const client = createDynamoDbDocument();
  const createdAt = new Date();
  const guess: StoredGuess = {
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
