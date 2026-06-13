import { Guess, GuessDirection, GuessResult, GuessKey } from "./guess.types";
import {
  createGuess,
  getPendingGuesses,
  getGuess as repoGetGuess,
  resolveGuessAndUpdatePlayerScore,
} from "./guess.repository";
import { COUNTDOWN } from "@/app/constant";
import { send } from "@/app/lib/queue";
import { computeScore, getPlayer } from "../players/player.service";
import { updatePlayer } from "../players/player.repository";

export async function getPendingGuess(
  playerId: string
): Promise<Guess | undefined> {
  const pendingGuesses = await getPendingGuesses({
    playerId,
  });

  if (pendingGuesses.length > 1) {
    throw new Error(`Player ${playerId} has more than 1 pending guess`);
  }

  return pendingGuesses[0];
}

export async function createPendingGuessForPlayer(input: {
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
}): Promise<Guess> {
  const resolvesAfter = new Date(new Date().getTime() + COUNTDOWN * 1000);

  const guess = await createGuess({
    ...input,
    resolvesAfter,
  });
  await enqueueGuessResolution(guess, { delaySeconds: COUNTDOWN });
  await updatePlayer(input.playerId, { latestGuessId: guess.id });

  return guess;
}

export async function resolveGuess(
  key: GuessKey,
  values: { price: number }
): Promise<void> {
  const guess = await getGuess(key);
  if (!guess) {
    throw new Error(
      `No guess found with id ${key.id} for player ${key.playerId}`
    );
  }
  const player = await getPlayer(guess.playerId);
  if (!player) {
    throw new Error(`No player found with id ${guess.playerId}`);
  }

  const evaluationResult = evaluateGuess(values.price, guess);

  if (!evaluationResult) {
    // not resolved, no need to do anything
    return;
  }

  const result = evaluationResult as GuessResult;

  const resolvedAt = new Date().toISOString();
  const resolvedPrice = values.price;
  const score = computeScore(player.score, result);

  await resolveGuessAndUpdatePlayerScore(key, {
    resolvedAt,
    resolvedPrice,
    score,
    result,
  });
}

export async function getGuess(input: { id: string; playerId: string }) {
  return repoGetGuess(input);
}

export async function enqueueGuessResolution(
  payload: GuessKey,
  options: { delaySeconds: number } = { delaySeconds: 1 }
): Promise<void> {
  await send(
    "guess",
    { id: payload.id, playerId: payload.playerId },
    { delaySeconds: options.delaySeconds }
  );
}

export function evaluateGuess(
  price: number,
  guess: Pick<Guess, "direction" | "entryPrice">
): GuessResult | boolean {
  const { entryPrice, direction } = guess;
  if (price === entryPrice) {
    return false;
  }

  const isWon = direction === "up" ? price > entryPrice : price < entryPrice;

  return isWon ? "won" : "lost";
}
