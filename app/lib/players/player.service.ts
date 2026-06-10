import { GuessEvaluation } from "../guesses/guess.types";
import { createPlayer, getPlayerById } from "./player.repository";
import { Player } from "./player.types";

export async function getPlayer(id: string): Promise<Player | undefined> {
  return getPlayerById(id);
}

export async function createNewPlayer(): Promise<Player> {
  return createPlayer({ score: 0 });
}

export function computeScore(
  score: number,
  guessResult: GuessEvaluation
): number {
  if (guessResult === "pending") {
    return score;
  }

  if (guessResult === "won") {
    return score + 1;
  }

  return score === 0 ? 0 : score - 1;
}
