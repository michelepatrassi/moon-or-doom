import { createDynamoDbDocument } from "../dynamodb";
import { Player } from "./player.types";

const TABLE_NAME = "players";

export async function getPlayerById(id: string): Promise<Player | undefined> {
  const client = createDynamoDbDocument();

  const player = await client.get({
    TableName: TABLE_NAME,
    Key: {
      id,
    },
  });

  return player.Item as Player;
}

type CreatePlayerInput = Pick<Player, "score">;

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const client = createDynamoDbDocument();
  const now = new Date().toISOString();
  const player = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await client.put({
    TableName: TABLE_NAME,
    Item: player,
  });

  return player;
}

type UpdatePlayerInput = CreatePlayerInput;

export async function updatePlayer(
  id: string,
  input: UpdatePlayerInput
): Promise<void> {
  const client = createDynamoDbDocument();
  const now = new Date().toISOString();

  await client.update({
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: "SET #score = :score, #updatedAt = :updatedAt",
    ExpressionAttributeNames: {
      "#score": "score",
      "#updatedAt": "updatedAt",
    },
    ExpressionAttributeValues: {
      ":score": input.score,
      ":updatedAt": now,
    },
  });
}
