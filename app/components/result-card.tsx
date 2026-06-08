"use client";

import { useState } from "react";
import { Card } from "./design-system/card";
import { getRandom } from "../utils/get-random";

type ResultCardProps = {
  isWon: boolean;
  score: number;
};

export const ResultCard = ({ isWon, score }: ResultCardProps) => {
  const [message] = useState(() =>
    getRandom(
      isWon
        ? [
            "Tiny candle. Giant ego.",
            "Profit whispered. You screamed.",
            "Your chart psychic era begins.",
            "One green pixel, endless swagger.",
            "The market winked. You winked back.",
          ]
        : [
            "The chart has spoken.",
            "Your crystal ball needs support.",
            "BTC said no with its whole chest.",
            "The candle filed a complaint.",
            "Gravity entered the group chat.",
          ]
    )
  );

  if (isWon) {
    return (
      <Card variant="success">
        <div className="space-y-6">
          <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-green-900 text-5xl text-green-400">
            🚀
          </div>

          <p className="font-mono text-lg font-bold leading-none text-green-400">
            CORRECT CALL
          </p>

          <h2 className="max-w-xl text-5xl font-black leading-tight tracking-normal text-white">
            {message}
          </h2>

          <p className="text-6xl font-black leading-none tracking-normal text-green-400">
            +1 point
          </p>

          <p className="max-w-xl text-xl leading-snug text-zinc-300">
            Moon was right: BTC landed higher after the timer cleared.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="danger">
      <div className="space-y-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-xl bg-red-900 text-5xl text-red-400">
          🔥
        </div>

        <p className="font-mono text-lg font-bold leading-none text-red-400">
          WRONG CALL
        </p>

        <h2 className="max-w-xl text-5xl font-black leading-tight tracking-normal text-white">
          {message}
        </h2>

        <p className="text-6xl font-black leading-none tracking-normal text-red-400">
          {score > 0 ? "-1 point" : "Try again"}
        </p>

        <p className="max-w-xl text-xl leading-snug text-zinc-300">
          Moon missed: BTC landed lower after the timer cleared.
        </p>
      </div>
    </Card>
  );
};
