"use client";

import { PricePanel } from "./components/price-panel";
import { type Ticker, useTicker } from "./hooks/use-ticker";
import { Header } from "./components/header";
import { GuessActions } from "./components/guess-actions";
import { ResultCard } from "./components/result-card";
import { ActiveGuess } from "./components/active-guess";
import { ReadyGuessCard } from "./components/ready-guess-card";
import { ErrorCard } from "./components/error-card";
import { TICKER } from "./constant";
import { usePlayer } from "./hooks/use-player";
import { AppError, GuessDirection } from "./types";
import { useGuess } from "./hooks/use-guess";
import { Guess } from "./lib/guesses/guess.types";
import { Loader } from "./components/design-system/loader";

const Home = () => {
  const {
    error,
    loading: loadingTicker,
    retry,
    value: currentPrice,
  } = useTicker({ select: (ticker: Ticker) => ticker.last });
  const {
    player,
    loading: isPlayerLoading,
    createPlayer,
    refreshPlayer,
  } = usePlayer();
  const {
    guess,
    createGuess,
    startPolling,
    isLoading: isGuessLoading,
  } = useGuess({
    guessId: player?.latestGuessId,
    onCreated: refreshPlayer,
    onResolved: refreshPlayer,
  });

  const handleOnGuess = async (direction: GuessDirection) => {
    if (!player) {
      await createPlayer();
    }

    createGuess(direction);
  };

  const loading = isPlayerLoading || isGuessLoading || loadingTicker;

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-8 px-4 py-32 sm:px-8 md:px-16">
        <Header score={player?.score} loading={isPlayerLoading} />
        <PricePanel
          error={error}
          loading={loadingTicker}
          price={currentPrice}
        />
        {loading ? (
          <Loader />
        ) : (
          <>
            <Content
              guess={guess}
              error={error}
              retry={retry}
              score={player!.score}
              startPolling={startPolling}
              handleOnGuess={handleOnGuess}
            />
          </>
        )}
      </main>
    </div>
  );
};

type ContentProps = {
  guess?: Guess;
  error?: AppError;
  score: number;
  retry: () => void;
  startPolling: () => void;
  handleOnGuess: (direction: GuessDirection) => void;
};

const Content = ({
  guess,
  error,
  retry,
  score,
  startPolling,
  handleOnGuess,
}: ContentProps) => {
  if (error) {
    return (
      <ErrorCard
        actionLabel={`Retry ${TICKER}`}
        error={error}
        onAction={retry}
      />
    );
  }

  if (!guess) {
    return (
      <>
        <ReadyGuessCard />
        <GuessActions onGuess={handleOnGuess} />
      </>
    );
  }

  if (guess.result) {
    return (
      <>
        <ResultCard isWon={guess.result === "won"} score={score} />
        <GuessActions onGuess={handleOnGuess} />
      </>
    );
  }

  return <ActiveGuess guess={guess} onComplete={startPolling} />;
};

export default Home;
