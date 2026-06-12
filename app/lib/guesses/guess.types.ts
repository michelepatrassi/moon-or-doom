export type GuessDirection = "up" | "down";
export type GuessResult = "won" | "lost";

export type Guess = {
  id: string;
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
  createdAt: string;
  updatedAt: string;
  resolvesAfter: string;
  resolvedAt?: string;
  resolvedPrice?: number;
  result?: GuessResult;
};

export type GuessKey = {
  id: string;
  playerId: string;
};
