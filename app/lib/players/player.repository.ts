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

type CreatePlayerInput = {
  score: number;
};

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
