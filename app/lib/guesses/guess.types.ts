export type GuessStatus = "pending" | "resolved";
export type GuessDirection = "up" | "down";

export type Guess = {
  id: string;
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
  status: GuessStatus;
  createdAt: string;
  resolvesAt: string;
};
