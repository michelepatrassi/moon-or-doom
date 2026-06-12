import React from "react";

import { Card } from "./design-system/card";
import { Chip } from "./design-system/chip";
import { Countdown } from "./countdown";
import { Guess } from "../lib/guesses/guess.types";
import { CRYPTO, TICKER } from "../constant";

export const ActiveGuess = ({
  guess,
  onComplete,
}: {
  guess: Guess;
  onComplete: () => void;
}) => {
  const isMoon = guess.direction === "up";
  const [remainingSeconds] = React.useState<number>(() => {
    return Math.max(
      0,
      Math.ceil((new Date(guess.resolvesAfter).getTime() - Date.now()) / 1000)
    );
  });

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs font-bold uppercase leading-none tracking-normal text-orange-400">
            Active guess
          </p>

          <Chip
            className="font-mono font-bold uppercase"
            variant={isMoon ? "success" : "danger"}
          >
            {isMoon ? "📈 Moon" : "📉 Doom"}
          </Chip>
        </div>

        <div className="flex w-full flex-col items-center justify-center py-10 text-center">
          {remainingSeconds ? (
            <Countdown seconds={remainingSeconds} onComplete={onComplete} />
          ) : (
            <div>
              <p className="text-center text-3xl font-black leading-none tracking-normal text-white tabular-nums">
                Market did not move
              </p>
              <p className="mt-5 text-center text-2xl font-bold leading-none tracking-normal text-white tabular-nums">
                Give it a couple of extra seconds...
              </p>
            </div>
          )}
        </div>

        <p className="text-sm leading-snug text-zinc-400">
          New guesses stay closed until 60 seconds pass and {TICKER} prints a
          different price.
        </p>
      </div>
    </Card>
  );
};
