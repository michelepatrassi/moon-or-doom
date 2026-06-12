import dynamoose from "dynamoose";

import { PlayerModel } from "../players/player.model";
import { GuessModel } from "./guess.model";
import { Guess, GuessDirection, GuessKey } from "./guess.types";

type GetPendingGuessesInput = {
  playerId?: string;
  dueAt?: Date;
};

export async function getPendingGuesses(
  input: GetPendingGuessesInput
): Promise<Guess[]> {
  if (input?.playerId) {
    const qb = GuessModel.query("playerId")
      .eq(input.playerId)
      .filter("resolvedAt")
      .not()
      .exists();

    if (input.dueAt) {
      qb.filter("resolvesAfter").le(input.dueAt.toISOString());
    }
    return qb.exec();
  }

  const qb = GuessModel.scan("resolvedAt").not().exists();

  if (input.dueAt) {
    qb.filter("resolvesAfter").le(input.dueAt.toISOString());
  }

  return qb.exec();
}

type CreateGuessInput = {
  direction: GuessDirection;
  playerId: string;
  entryPrice: number;
  resolvesAfter: Date;
};

export async function createGuess(input: CreateGuessInput) {
  const { playerId, direction, entryPrice, resolvesAfter } = input;

  const now = new Date();
  const guess: Guess = {
    id: crypto.randomUUID(),
    playerId,
    direction,
    entryPrice,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    resolvesAfter: resolvesAfter.toISOString(),
  };

  return GuessModel.create(guess);
}

export async function updateGuess(
  key: GuessKey,
  values: Pick<Guess, "resolvedAt" | "resolvedPrice">
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
  values: Pick<Guess, "resolvedAt" | "resolvedPrice" | "result"> & {
    score: number;
  }
): Promise<void> {
  await dynamoose.transaction([
    GuessModel.transaction.update(
      key,
      {
        resolvedAt: values.resolvedAt,
        resolvedPrice: values.resolvedPrice,
        updatedAt: values.resolvedAt,
        result: values.result,
      },
      {
        condition: new dynamoose.Condition().where("resolvedAt").not().exists(),
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
