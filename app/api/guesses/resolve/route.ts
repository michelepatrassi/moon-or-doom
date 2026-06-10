import { TICKER } from "@/app/constant";
import { getCurrentPrice } from "@/app/lib/market-data";
import {
  getPendingGuesses,
  enqueueGuessResolution,
  resolveGuess,
} from "@/app/lib/guesses/guess.service";

export async function GET() {
  try {
    const pendingGuesses = await getPendingGuesses();
    const currentPrice = await getCurrentPrice(TICKER);
    const resolvedAt = new Date();
    const now = resolvedAt.toISOString();

    for (const guess of pendingGuesses) {
      if (guess.resolvesAfter <= now) {
        if (guess.entryPrice === currentPrice) {
          await enqueueGuessResolution(guess);
        } else {
          await resolveGuess(guess, { price: currentPrice });
        }
      }
    }

    return new Response("OK");
  } catch (error) {
    console.error("Error in cron job:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
