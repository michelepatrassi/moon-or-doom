import { Guess } from "../types";

export type GuessEvaluation = "won" | "lost" | "pending";

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
