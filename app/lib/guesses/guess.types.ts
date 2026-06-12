export type GuessStatus = "pending" | "resolved";
export type GuessDirection = "up" | "down";
export type GuessResult = "won" | "lost";

export type Guess = {
  id: string;
  playerId: string;
  direction: GuessDirection;
  entryPrice: number;
  status: GuessStatus; //TODO: remove. Can be inferred from resolution props
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
