"use client";

import { GuessDirection, type Guess } from "../lib/guesses/guess.types";
import { type Player } from "../lib/players/player.types";
import { type Ticker, useTicker } from "./use-ticker";
import { useGuess } from "./use-guess";
import { usePlayer } from "./use-player";

type ErrorCode = "fetch_failed" | "create_failed";

export type SessionError = {
  code?: ErrorCode;
};

type MoonOrDoomSessionPlayer = {
  current?: Player;
  error?: SessionError;
  loading: boolean;
  score: number;
  clear: () => void;
};

type MoonOrDoomSessionTicker = {
  error?: SessionError;
  loading: boolean;
  price?: number;
  retry: () => void;
};

type MoonOrDoomSessionGuess = {
  current?: Guess;
  loading: boolean;
  error?: SessionError;
  startPolling: () => void;
  submit: (direction: GuessDirection) => Promise<void>;
};

export type MoonOrDoomSession = {
  guess: MoonOrDoomSessionGuess;
  player: MoonOrDoomSessionPlayer;
  ticker: MoonOrDoomSessionTicker;
};

export const useMoonOrDoomSession = (): MoonOrDoomSession => {
  const {
    error: tickerError,
    loading: tickerLoading,
    retry: retryTicker,
    value: currentPrice,
  } = useTicker({ select: (ticker: Ticker) => ticker.last });

  const {
    error: playerError,
    loading: playerLoading,
    player,
    createPlayer,
    refreshPlayer,
    clearPlayer,
  } = usePlayer();

  const {
    guess,
    createGuess,
    startPolling,
    isLoading: guessLoading,
    error: guessError,
  } = useGuess({
    guessId: player?.latestGuessId,
    onCreated: refreshPlayer,
    onResolved: refreshPlayer,
  });

  const submitGuess = async (direction: GuessDirection) => {
    const currentPlayer = player ?? (await createPlayer());

    if (!currentPlayer) {
      return;
    }

    await createGuess(direction);
  };

  return {
    guess: {
      current: guess,
      error: guessError,
      loading: guessLoading,
      startPolling,
      submit: submitGuess,
    },
    player: {
      current: player,
      error: playerError,
      loading: playerLoading,
      score: player?.score ?? 0,
      clear: clearPlayer,
    },
    ticker: {
      error: tickerError,
      loading: tickerLoading,
      price: currentPrice,
      retry: retryTicker,
    },
  };
};
