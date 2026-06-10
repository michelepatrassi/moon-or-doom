import { GuessDirection } from "./lib/guesses/guess.types";

export type { GuessDirection };

export type Guess = {
  snapshotPrice: number;
  direction: GuessDirection;
};

export type AppError = {
  title: string;
  message: string;
};
