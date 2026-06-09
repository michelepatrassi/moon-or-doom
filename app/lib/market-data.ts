import { getKrakenCurrentPrice } from "./providers/kraken";

export const getCurrentPrice = (ticker: string): Promise<number> =>
  getKrakenCurrentPrice(ticker);
