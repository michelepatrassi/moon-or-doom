"use client";

import React from "react";
import { TICKER } from "../constant";
import { SessionError } from "./use-moon-or-doom-session";

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

export function useTicker<SelectedValue>({
  select,
  symbol = TICKER,
}: UseTickerOptions<SelectedValue>) {
  const [value, setValue] = React.useState<SelectedValue | undefined>(
    undefined
  );
  const [error, setError] = React.useState<SessionError>();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [connectionAttempt, reconnect] = React.useReducer(
    (attempt: number) => attempt + 1,
    0
  );

  const selectTickerValue = React.useEffectEvent((ticker: Ticker) =>
    select(ticker)
  );

  const retry = () => {
    setError(undefined);
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
        })
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
          setError(undefined);
        }
      }
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);

      hasError = true;
      setError({
        code: "fetch_failed",
      });
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
