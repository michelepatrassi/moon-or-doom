import { COUNTDOWN } from "../constant";
import { Guess } from "../types";
import { type GamePhase } from "../hooks/use-moon-or-doom-game";
import { Card } from "./design-system/card";
import { Chip } from "./design-system/chip";
import { Countdown } from "./countdown";

type ActiveGuessStatus = Extract<
  GamePhase,
  "countingDown" | "waitingForPriceToMove"
>;

export const ActiveGuess = ({
  guess,
  onComplete,
  status,
}: {
  guess: Guess;
  onComplete: () => void;
  status: ActiveGuessStatus;
}) => {
  const isMoon = guess.direction === "up";

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
          {status === "waitingForPriceToMove" ? (
            <div>
              <p className="text-center text-3xl font-black leading-none tracking-normal text-white tabular-nums">
                Market did not move
              </p>
              <p className="mt-5 text-center text-2xl font-bold leading-none tracking-normal text-white tabular-nums">
                Give it a couple of extra seconds...
              </p>
            </div>
          ) : (
            <Countdown seconds={COUNTDOWN} onComplete={onComplete} />
          )}
        </div>

        <p className="text-sm leading-snug text-zinc-400">
          New guesses stay closed until 60 seconds pass and BTC prints a
          different price.
        </p>
      </div>
    </Card>
  );
};
