import React from "react";

import { Card } from "./design-system/card";
import { Chip } from "./design-system/chip";
import { Countdown } from "./countdown";
import { Guess, GuessDirection } from "../lib/guesses/guess.types";
import { COUNTDOWN, TICKER } from "../constant";
import { Loader } from "./design-system/loader";

type WrapperProps = {
  children: React.ReactNode;
  direction: GuessDirection;
};
const Wrapper = ({ direction, children }: WrapperProps) => {
  const isMoon = direction === "up";

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
          {children}
        </div>

        <p className="text-sm leading-snug text-zinc-400">
          New guesses stay closed until {COUNTDOWN} seconds pass and {TICKER}{" "}
          prints a different price.
        </p>
      </div>
    </Card>
  );
};

export const ActiveGuess = ({
  guess,
  onDue,
}: {
  guess: Guess;
  onDue: () => void;
}) => {
  const [remainingSeconds] = React.useState<number>(() => {
    return Math.max(
      0,
      Math.ceil((new Date(guess.resolvesAfter).getTime() - Date.now()) / 1000)
    );
  });
  const [countdownFinished, setCountdownFinished] = React.useState(false);
  const notifyDue = React.useEffectEvent(() => {
    onDue();
  });

  const isDue = remainingSeconds === 0 || countdownFinished;

  const handleCountdownComplete = () => {
    setCountdownFinished(true);
  };

  React.useEffect(() => {
    if (isDue) {
      notifyDue();
    }
  }, [isDue]);

  if (isDue) {
    return (
      <Wrapper direction={guess.direction}>
        <div className="flex flex-col items-center">
          <p className="text-center text-3xl font-black leading-none tracking-normal text-white tabular-nums">
            Resolving your guess
          </p>
          <p className="mt-5 text-center text-2xl font-bold leading-none tracking-normal text-white tabular-nums">
            Waiting for the next price move...
          </p>
          <Loader className="mt-10" size="lg" />
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper direction={guess.direction}>
      <Countdown
        seconds={remainingSeconds}
        onComplete={handleCountdownComplete}
      />
    </Wrapper>
  );
};
