import { Player } from "./player.types";
import { PlayerModel } from "./player.model";

export async function getPlayerById(id: string): Promise<Player | undefined> {
  return PlayerModel.get(id);
}

type CreatePlayerInput = Pick<Player, "score">;

export async function createPlayer(input: CreatePlayerInput): Promise<Player> {
  const now = new Date().toISOString();
  const player = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  return PlayerModel.create(player);
}

type UpdatePlayerInput = Partial<Pick<Player, "latestGuessId" | "score">>;

export async function updatePlayer(
  id: string,
  input: UpdatePlayerInput
): Promise<Player> {
  const now = new Date().toISOString();
  const update: UpdatePlayerInput & Pick<Player, "updatedAt"> = {
    ...input,
    updatedAt: now,
  };

  return PlayerModel.update({ id }, update);
}
