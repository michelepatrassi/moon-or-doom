import { Guess, GuessDirection } from "./guess.types";
import { createGuess, getGuesses, updateGuess } from "./guess.repository";
import { COUNTDOWN } from "@/app/constant";

export async function getPendingGuess(
  playerId: string
): Promise<Guess | undefined> {
  const pendingGuesses = await getGuesses({
    status: "pending",
    playerId,
  });

  if (pendingGuesses.length > 1) {
    throw new Error(`Player ${playerId} has more than 1 pending guess`);
  }

  return pendingGuesses[0];
}

export async function createPendingGuess(input: {
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
}): Promise<Guess> {
  const resolvesAt = new Date(new Date().getTime() + COUNTDOWN * 1000);

  return createGuess({ ...input, status: "pending", resolvesAt });
}

export async function getPendingGuesses(): Promise<Guess[]> {
  return getGuesses({ status: "pending" });
}

export async function resolveGuess(id: string): Promise<void> {
  //TODO: complete guess resolution (e.g. resolvedAt, score)
  await updateGuess(id, { status: "resolved" });
}
