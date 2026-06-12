import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { TICKER } from "@/app/constant";
import { getCurrentPrice } from "@/app/lib/market-data";
import { getPlayerId } from "@/app/lib/session";
import {
  createPendingGuessForPlayer,
  getPendingGuess,
} from "@/app/lib/guesses/guess.service";
import { getPlayer } from "@/app/lib/players/player.service";
import { Guess } from "@/app/lib/guesses/guess.types";

type ErrorResponse = {
  error: string;
};

const createGuessRequestBodySchema = z.strictObject({
  direction: z.enum(["up", "down"]),
});

export async function POST(
  request: NextRequest
): Promise<NextResponse<Guess | ErrorResponse>> {
  const playerId = await getPlayerId();

  if (!playerId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 401 });
  }

  const player = await getPlayer(playerId);

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const pendingGuess = await getPendingGuess(playerId);

  if (pendingGuess) {
    return NextResponse.json(
      {
        error: `Pending guess already exists. Found ${pendingGuess.id}`,
      },
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

  const { direction } = result.data;

  let entryPrice: number;

  try {
    entryPrice = await getCurrentPrice(TICKER);
  } catch (error) {
    console.error("Failed to create guess:", error);

    return NextResponse.json({ error: "Price unavailable" }, { status: 503 });
  }

  const guess = await createPendingGuessForPlayer({
    playerId,
    direction,
    entryPrice,
  });

  return NextResponse.json(guess, { status: 201 });
}
