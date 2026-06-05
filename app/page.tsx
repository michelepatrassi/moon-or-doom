"use client";

import { PricePanel } from "./components/price-panel";
import { type Ticker, useTicker } from "./hooks/use-ticker";
import { Header } from "./components/header";
import { GuessActions } from "./components/guess-actions";
import { ResultCard } from "./components/result-card";
import { ActiveGuess } from "./components/active-guess";
import { ReadyGuessCard } from "./components/ready-guess-card";
import { useMoonOrDoomGame } from "./hooks/use-moon-or-doom-game";
import { ErrorCard } from "./components/error-card";
import { TICKER } from "./constant";

const selectLastPrice = (ticker: Ticker) => ticker.last;

const Home = () => {
  const {
    error,
    loading,
    retry,
    value: currentPrice,
  } = useTicker({ select: selectLastPrice });
  const { finishCountdown, game, placeGuess } = useMoonOrDoomGame(currentPrice);
  const hasLivePrice = !error && typeof currentPrice === "number";
  const activeGuessStatus =
    game.phase === "countingDown" || game.phase === "waitingForPriceToMove"
      ? game.phase
      : null;

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-8 px-4 py-32 sm:px-8 md:px-16">
        <Header score={game.score} />
        <PricePanel error={error} loading={loading} price={currentPrice} />
        {error && (
          <ErrorCard
            actionLabel={`Retry ${TICKER}`}
            error={error}
            onAction={retry}
          />
        )}
        {!error && game.phase === "ready" && <ReadyGuessCard />}
        {activeGuessStatus && game.guess && (
          <ActiveGuess
            guess={game.guess}
            onComplete={finishCountdown}
            status={activeGuessStatus}
          />
        )}
        {!error && game.phase === "resolved" && game.result && (
          <ResultCard isWon={game.result === "won"} score={game.score} />
        )}

        <GuessActions
          onGuess={placeGuess}
          disabled={!hasLivePrice || !!activeGuessStatus}
        />
      </main>
    </div>
  );
};

export default Home;
