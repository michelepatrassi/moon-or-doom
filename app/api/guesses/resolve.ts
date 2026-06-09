import { TICKER } from "@/app/constant";
import { getPendingGuesses, updateGuess } from "@/app/lib/models/guesses";
import { getCurrentPrice } from "@/app/lib/market-data";

export async function GET(_: Request) {
  try {
    const pendingGuesses = await getPendingGuesses();
    const currentPrice = await getCurrentPrice(TICKER);

    const now = new Date().toISOString();

    for (const guess of pendingGuesses) {
      if (guess.resolvesAt <= now && guess.entryPrice !== currentPrice) {
        await updateGuess({ ...guess, status: "resolved" });
      }
    }

    return new Response("OK");
  } catch (error) {
    console.error("Error in cron job:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
