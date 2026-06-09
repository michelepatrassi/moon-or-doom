import axios from "axios";

const KRAKEN_TICKER_URL = "https://api.kraken.com/0/public/Ticker";

type KrakenTicker = {
  c?: [string, string];
};

type KrakenTickerResponse = {
  error?: string[];
  result?: Record<string, KrakenTicker>;
};

export async function getKrakenCurrentPrice(pair: string): Promise<number> {
  const response = await axios.get<KrakenTickerResponse>(KRAKEN_TICKER_URL, {
    params: {
      pair,
    },
  });
  const payload = response.data;

  if (payload.error?.length) {
    console.error("Kraken API error:", payload.error);
    throw new Error("Kraken returned an error");
  }

  const krakenTicker = payload.result
    ? Object.values(payload.result)[0]
    : undefined;
  const price = Number(krakenTicker?.c?.[0]);

  if (!Number.isFinite(price)) {
    throw new Error("Kraken returned an invalid price");
  }

  return price;
}
