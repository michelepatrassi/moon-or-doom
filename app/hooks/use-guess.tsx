import React from "react";
import { Guess, GuessDirection } from "../lib/guesses/guess.types";
import axios from "axios";

type UseGuessProps = {
  guessId: string | undefined;
  onCreated?: () => Promise<void>;
  onResolved?: () => Promise<void>;
};

export const useGuess = ({ guessId, onCreated, onResolved }: UseGuessProps) => {
  const [guess, setGuess] = React.useState<Guess>();
  const timeoutRef = React.useRef<number>(undefined);
  const isPollingRef = React.useRef<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const createGuess = async (direction: GuessDirection) => {
    const { data } = await axios.post<Guess>("/api/guesses", {
      direction,
    });

    await onCreated?.();

    setGuess(data);
  };

  const startPolling = async () => {
    if (!guessId || isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;

    const { data } = await axios.get<Guess>(`/api/guesses/${guessId}`);

    isPollingRef.current = false;

    if (data.resolvedAt) {
      await onResolved?.();

      setGuess(data);
    } else {
      timeoutRef.current = window.setTimeout(startPolling, 1000);
    }
  };

  React.useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  React.useEffect(() => {
    const getGuess = async (id: string) => {
      setIsLoading(true);

      const { data } = await axios.get<Guess>(`/api/guesses/${id}`);

      setGuess(data);
      setIsLoading(false);
    };

    if (guessId) {
      getGuess(guessId);
    }
  }, [guessId]);

  return { createGuess, guess, startPolling, isLoading };
};
