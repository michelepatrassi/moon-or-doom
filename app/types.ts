export type GuessDirection = "up" | "down";
export type Guess = {
  snapshotPrice: number;
  direction: GuessDirection;
};

export type AppError = {
  title: string;
  message: string;
};
