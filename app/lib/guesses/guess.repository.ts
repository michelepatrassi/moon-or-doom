import dynamoose from "dynamoose";

import { PlayerModel } from "../players/player.model";
import { GuessModel } from "./guess.model";
import { Guess, GuessDirection, GuessKey, GuessStatus } from "./guess.types";

type GetGuessesInput = {
  status: GuessStatus;
  playerId?: string;
};

export async function getGuesses(input: GetGuessesInput): Promise<Guess[]> {
  if (!input.playerId) {
    return GuessModel.scan("status").eq(input.status).exec();
  }

  return GuessModel.query("playerId")
    .eq(input.playerId)
    .filter("status")
    .eq(input.status)
    .exec();
}

type CreateGuessInput = {
  direction: GuessDirection;
  playerId: string;
  entryPrice: number;
  status: GuessStatus;
  resolvesAfter: Date;
};

export async function createGuess(input: CreateGuessInput) {
  const { playerId, direction, entryPrice, status, resolvesAfter } = input;

  const now = new Date();
  const guess: Guess = {
    id: crypto.randomUUID(),
    playerId,
    direction,
    entryPrice,
    status,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    resolvesAfter: resolvesAfter.toISOString(),
  };

  return GuessModel.create(guess);
}

export async function updateGuess(
  key: GuessKey,
  values: Pick<Guess, "resolvedAt" | "resolvedPrice" | "status">
): Promise<void> {
  const now = new Date().toISOString();

  await GuessModel.update(key, {
    ...values,
    updatedAt: now,
  });
}

export async function getGuess(input: GuessKey): Promise<Guess | undefined> {
  return GuessModel.get(input);
}

export async function resolveGuessAndUpdatePlayerScore(
  key: GuessKey,
  values: Pick<Guess, "resolvedAt" | "resolvedPrice" | "status" | "result"> & {
    score: number;
  }
): Promise<void> {
  await dynamoose.transaction([
    GuessModel.transaction.update(
      key,
      {
        resolvedAt: values.resolvedAt,
        resolvedPrice: values.resolvedPrice,
        status: values.status,
        updatedAt: values.resolvedAt,
        result: values.result,
      },
      {
        condition: new dynamoose.Condition().where("status").eq("pending"),
      }
    ),
    PlayerModel.transaction.update(
      { id: key.playerId },
      {
        score: values.score,
        updatedAt: values.resolvedAt,
      }
    ),
  ]);
}
