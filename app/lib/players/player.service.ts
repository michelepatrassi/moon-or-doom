import { createPlayer, getPlayerById } from "./player.repository";
import { Player } from "./player.types";

export async function getPlayer(id: string): Promise<Player | undefined> {
  return getPlayerById(id);
}

export async function createNewPlayer(): Promise<Player> {
  return createPlayer({ score: 0 });
}
