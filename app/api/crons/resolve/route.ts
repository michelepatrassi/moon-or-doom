import { TICKER } from "@/app/constant";
import { getCurrentPrice } from "@/app/lib/market-data";
import {
  enqueueGuessResolution,
  getDueGuesses,
  resolveGuess,
} from "@/app/lib/guesses/guess.service";

export async function GET() {
  try {
    const dueDate = new Date();
    const dueGuesses = await getDueGuesses(dueDate);
    const currentPrice = await getCurrentPrice(TICKER);

    for (const guess of dueGuesses) {
      if (guess.entryPrice === currentPrice) {
        await enqueueGuessResolution(guess);
      } else {
        await resolveGuess(guess, { price: currentPrice });
      }
    }

    return new Response("OK");
  } catch (error) {
    console.error("Error in cron job:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
