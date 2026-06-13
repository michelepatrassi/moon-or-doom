"use client";

import { PricePanel } from "./components/price-panel";
import { Header } from "./components/header";
import { GuessActions } from "./components/guess-actions";
import { ResultCard } from "./components/result-card";
import { ActiveGuess } from "./components/active-guess";
import { ReadyGuessCard } from "./components/ready-guess-card";
import { ErrorCard } from "./components/error-card";
import { TICKER } from "./constant";
import { Loader } from "./components/design-system/loader";
import {
  type MoonOrDoomSession,
  useMoonOrDoomSession,
} from "./hooks/use-moon-or-doom-session";
import { Card } from "./components/design-system/card";

const Home = () => {
  const session = useMoonOrDoomSession();

  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center gap-8 px-4 py-32 sm:px-8 md:px-16">
        <Header score={session.player.score} loading={session.player.loading} />
        <PricePanel
          error={session.ticker.error}
          loading={session.ticker.loading}
          price={session.ticker.price}
        />
        <Content session={session} />
      </main>
    </div>
  );
};

type ContentProps = {
  session: MoonOrDoomSession;
};

const Content = ({ session }: ContentProps) => {
  const loading =
    session.player.loading || session.guess.loading || session.ticker.loading;

  if (loading) {
    return (
      <Card className="flex align items-center justify-center py-24">
        <Loader size="lg" />
      </Card>
    );
  }

  if (session.ticker.error) {
    return (
      <ErrorCard
        title={`Error loading ${TICKER} price`}
        actionLabel={`Try again`}
        onAction={session.ticker.retry}
      />
    );
  }

  if (session.player.error) {
    return (
      <>
        <ErrorCard
          title="Profile unavailable"
          actionLabel={`Logout`}
          onAction={session.player.clear}
        />
      </>
    );
  }

  if (session.guess.error) {
    const isCreate = session.guess.error.code === "create_failed";
    const reload = () => window.location.reload();

    return (
      <>
        <ErrorCard
          title={isCreate ? "Failed creating guess" : "Failed loading guess"}
          actionLabel={`Reload`}
          onAction={reload}
        />
      </>
    );
  }

  if (!session.guess.current) {
    return (
      <>
        <ReadyGuessCard />
        <GuessActions onGuess={session.guess.submit} />
      </>
    );
  }

  if (session.guess.current.result) {
    return (
      <>
        <ResultCard
          isWon={session.guess.current.result === "won"}
          score={session.player.score}
        />
        <GuessActions onGuess={session.guess.submit} />
      </>
    );
  }

  return (
    <ActiveGuess
      guess={session.guess.current}
      onDue={session.guess.startPolling}
    />
  );
};

export default Home;
