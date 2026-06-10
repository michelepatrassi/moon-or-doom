import { type GuessEvaluation } from "../lib/guesses/guess.types";
import { Guess } from "../types";

export type { GuessEvaluation };

//TODO: cleanup, evaluation is now in BE only
export const evaluateGuess = ({
  currentPrice,
  guess,
}: {
  currentPrice: number;
  guess: Guess;
}): GuessEvaluation => {
  const { snapshotPrice, direction } = guess;
  if (currentPrice === snapshotPrice) {
    return "pending";
  }

  const isWon =
    direction === "up"
      ? currentPrice > snapshotPrice
      : currentPrice < snapshotPrice;

  return isWon ? "won" : "lost";
};
