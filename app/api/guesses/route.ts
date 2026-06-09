import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { TICKER } from "@/app/constant";
import {
  createGuess,
  getPendingGuess,
  type Guess,
} from "@/app/lib/models/guesses";
import { getCurrentPrice } from "@/app/lib/market-data";
import { getPlayer } from "@/app/lib/models/players";

type GuessResponse = {
  guess: Guess;
};

type ErrorResponse = {
  error: string;
};

const createGuessRequestBodySchema = z.strictObject({
  direction: z.enum(["up", "down"]),
});

const COOKIE_NAME = "player-id";

export async function POST(
  request: NextRequest
): Promise<NextResponse<GuessResponse | ErrorResponse>> {
  const cookieStore = await cookies();
  const playerId = cookieStore.get(COOKIE_NAME)?.value;

  if (typeof playerId !== "string") {
    return NextResponse.json({ error: "Missing player id" }, { status: 401 });
  }

  const currentPlayerId: string = playerId;

  const player = await getPlayer(currentPlayerId);

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const pendingGuess = await getPendingGuess(currentPlayerId);

  if (pendingGuess) {
    return NextResponse.json(
      { error: "Pending guess already exists" },
      { status: 409 }
    );
  }

  const json = await request.json();
  const result = createGuessRequestBodySchema.safeParse(json);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid guess direction" },
      { status: 400 }
    );
  }

  const direction = result.data.direction;

  let entryPrice: number;

  try {
    entryPrice = await getCurrentPrice(TICKER);
  } catch (error) {
    console.error("Failed to create guess:", error);

    return NextResponse.json({ error: "Price unavailable" }, { status: 503 });
  }

  const guess = await createGuess({
    playerId: currentPlayerId,
    direction,
    entryPrice,
  });

  return NextResponse.json({ guess }, { status: 201 });
}
