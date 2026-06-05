"use client";

import React from "react";
import { TICKER } from "../constant";
import { type AppError } from "../types";

export type Ticker = {
  bid: number;
  ask: number;
  last: number;
  change_pct: number;
  timestamp: string;
};

type UseTickerOptions<SelectedValue> = {
  select: (ticker: Ticker) => SelectedValue;
  symbol?: string;
};

const tickerConnectionError: AppError = {
  title: "Live price unavailable",
  message: "BTC/USD could not be fetched from the price service.",
};

export function useTicker<SelectedValue>({
  select,
  symbol = TICKER,
}: UseTickerOptions<SelectedValue>): {
  error: AppError | null;
  loading: boolean;
  retry: () => void;
  value: SelectedValue | undefined;
} {
  const [value, setValue] = React.useState<SelectedValue | undefined>(
    undefined,
  );
  const [error, setError] = React.useState<AppError | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connectionAttempt, reconnect] = React.useReducer(
    (attempt: number) => attempt + 1,
    0,
  );

  const selectTickerValue = React.useEffectEvent((ticker: Ticker) =>
    select(ticker),
  );

  const retry = () => {
    setError(null);
    setLoading(true);
    setValue(undefined);
    reconnect();
  };

  React.useEffect(() => {
    const ws = new WebSocket("wss://ws.kraken.com/v2");
    let hasValue = false;
    let hasError = false;
    let isInitialMessage = true;
    let currentValue: SelectedValue;

    ws.addEventListener("open", () => {
      ws.send(
        JSON.stringify({
          method: "subscribe",
          params: {
            channel: "ticker",
            symbol: [symbol],
            snapshot: true,
          },
        }),
      );
    });

    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (message.channel === "ticker" && message.data?.[0]) {
        const nextTicker = message.data[0] as Ticker;
        const nextValue = selectTickerValue(nextTicker);
        const hasSameValue = hasValue && Object.is(currentValue, nextValue);

        if (!hasSameValue) {
          currentValue = nextValue;
          hasValue = true;
          setValue(nextValue);
        }

        if (isInitialMessage) {
          isInitialMessage = false;
          setLoading(false);
        }

        if (hasError) {
          hasError = false;
          setError(null);
        }
      }
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);

      hasError = true;
      setError(tickerConnectionError);
      setLoading(false);
      setValue(undefined);
      ws.close();
      hasValue = false;
      isInitialMessage = true;
    });

    return () => {
      ws.close();
    };
  }, [connectionAttempt, symbol]);

  return { error, loading, retry, value };
}
