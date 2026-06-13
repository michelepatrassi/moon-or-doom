import React from "react";
import { Guess, GuessDirection } from "../lib/guesses/guess.types";
import axios from "axios";
import { SessionError } from "./use-moon-or-doom-session";

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
  const [error, setError] = React.useState<SessionError>();

  const createGuess = async (direction: GuessDirection) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post<Guess>("/api/guesses", {
        direction,
      });

      await onCreated?.();

      setGuess(data);
    } catch (e) {
      console.error(e);
      setError({ code: "create_failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = async () => {
    if (!guessId || isPollingRef.current) {
      return;
    }

    isPollingRef.current = true;

    try {
      const { data } = await axios.get<Guess>(`/api/guesses/${guessId}`);

      if (data.resolvedAt) {
        await onResolved?.();

        setGuess(data);
      } else {
        timeoutRef.current = window.setTimeout(startPolling, 1000);
      }
    } catch (e) {
      console.error(e);
      setError({ code: "fetch_failed" });
    } finally {
      isPollingRef.current = false;
    }
  };

  React.useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  React.useEffect(() => {
    const getGuess = async (id: string) => {
      setIsLoading(true);

      try {
        const { data } = await axios.get<Guess>(`/api/guesses/${id}`);

        setGuess(data);
      } catch (e) {
        console.error(e);
        setError({ code: "fetch_failed" });
      } finally {
        setIsLoading(false);
      }
    };

    if (guessId) {
      getGuess(guessId);
    }
  }, [guessId]);

  return { createGuess, guess, startPolling, isLoading, error };
};
