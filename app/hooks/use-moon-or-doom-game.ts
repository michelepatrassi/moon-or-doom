"use client";

import React from "react";
import { type Guess, type GuessDirection } from "../types";
import { evaluateGuess, type GuessEvaluation } from "../utils/evaluate-guess";

export type GamePhase =
  | "loadingScore"
  | "ready"
  | "countingDown"
  | "waitingForPriceToMove"
  | "resolved";

type ResolvedGuessResult = Exclude<GuessEvaluation, "pending">;

type GameState = {
  phase: GamePhase;
  guess: Guess | null;
  result: ResolvedGuessResult | null;
  score: number | undefined;
};

type GameAction =
  | {
      currentPrice: number;
      direction: GuessDirection;
      type: "placeGuess";
    }
  | {
      currentPrice: number | undefined;
      type: "finishCountdown";
    }
  | {
      currentPrice: number;
      type: "priceChanged";
    }
  | {
      type: "initScore";
      score: number;
    };

const getNextScore = ({
  result,
  score,
}: {
  result: ResolvedGuessResult;
  score: number;
}) => {
  if (result === "won") {
    return score + 1;
  }

  return score === 0 ? 0 : score - 1;
};

const getResolvedGame = ({
  currentPrice,
  game,
}: {
  currentPrice: number;
  game: GameState;
}): GameState | null => {
  if (!game.guess) {
    return null;
  }

  const result = evaluateGuess({
    currentPrice,
    guess: game.guess,
  });

  if (result === "pending") {
    return null;
  }

  return {
    phase: "resolved",
    guess: game.guess,
    result,
    score: getNextScore({ result, score: game.score as number }),
  };
};

const gameReducer = (game: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "placeGuess":
      return {
        phase: "countingDown",
        guess: {
          direction: action.direction,
          snapshotPrice: action.currentPrice,
        },
        result: null,
        score: game.score,
      };

    case "finishCountdown": {
      if (game.phase !== "countingDown") {
        return game;
      }

      if (typeof action.currentPrice !== "number") {
        return {
          ...game,
          phase: "waitingForPriceToMove",
        };
      }

      const resolvedGame = getResolvedGame({
        currentPrice: action.currentPrice,
        game,
      });

      return (
        resolvedGame ?? {
          ...game,
          phase: "waitingForPriceToMove",
        }
      );
    }

    case "priceChanged":
      if (game.phase !== "waitingForPriceToMove") {
        return game;
      }

      return (
        getResolvedGame({
          currentPrice: action.currentPrice,
          game,
        }) ?? game
      );

    case "initScore":
      if (game.phase !== "loadingScore") {
        return game;
      }

      return {
        ...game,
        phase: "ready",
        score: action.score,
      };

    default:
      return game;
  }
};

type Props = {
  currentPrice: number | undefined;
  score: number | undefined;
};

export const useMoonOrDoomGame = ({ currentPrice, score }: Props) => {
  const [game, dispatch] = React.useReducer(gameReducer, {
    phase: typeof score === "number" ? "ready" : "loadingScore",
    guess: null,
    result: null,
    score,
  });

  const placeGuess = (direction: GuessDirection) => {
    if (game.phase !== "ready" || typeof currentPrice !== "number") {
      return;
    }

    dispatch({
      currentPrice,
      direction,
      type: "placeGuess",
    });
  };

  const finishCountdown = () => {
    dispatch({
      currentPrice,
      type: "finishCountdown",
    });
  };

  React.useEffect(() => {
    if (
      game.phase !== "waitingForPriceToMove" ||
      typeof currentPrice !== "number"
    ) {
      return;
    }

    dispatch({
      currentPrice,
      type: "priceChanged",
    });
  }, [currentPrice, game.phase]);

  React.useEffect(() => {
    if (typeof score !== "number") {
      return;
    }

    dispatch({
      type: "initScore",
      score,
    });
  }, [score]);

  return {
    finishCountdown,
    game,
    placeGuess,
  };
};
