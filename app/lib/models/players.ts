import { createDynamoDbDocument } from "../dynamodb";

export type Player = {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
};

const TABLE_NAME = "players";

export async function getPlayer(id: string): Promise<Player | null> {
  const client = createDynamoDbDocument();

  const player = await client.get({
    TableName: TABLE_NAME,
    Key: {
      id,
    },
  });

  return (player.Item as Player | undefined) ?? null;
}

export async function createPlayer(id: string): Promise<Player> {
  const client = createDynamoDbDocument();
  const now = new Date().toISOString();
  const player: Player = {
    id,
    score: 0,
    createdAt: now,
    updatedAt: now,
  };

  await client.put({
    TableName: TABLE_NAME,
    Item: player,
  });

  return player;
}
