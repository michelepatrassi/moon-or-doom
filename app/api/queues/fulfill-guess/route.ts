import { TICKER } from "@/app/constant";
import {
  enqueueGuessResolution,
  getGuess,
  resolveGuess,
} from "@/app/lib/guesses/guess.service";
import { GuessKey } from "@/app/lib/guesses/guess.types";
import { getCurrentPrice } from "@/app/lib/market-data";
import { handleCallback } from "@/app/lib/queue";

export const POST = handleCallback<GuessKey>(async (payload) => {
  const guess = await getGuess(payload);

  if (!guess || guess.resolvedAt) {
    return;
  }

  const currentPrice = await getCurrentPrice(TICKER);

  if (guess.entryPrice === currentPrice) {
    await enqueueGuessResolution(payload);
  } else {
    await resolveGuess(guess, { price: currentPrice });
  }
});
