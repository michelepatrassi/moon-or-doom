import { getPlayerId } from "@/app/lib/session";
import { NextResponse } from "next/server";
import { Guess } from "@/app/lib/guesses/guess.types";
import { getPendingGuess } from "@/app/lib/guesses/guess.service";
import { getPlayer } from "@/app/lib/players/player.service";

type ErrorResponse = {
  error: string;
};

export async function GET(): Promise<
  NextResponse<Guess | ErrorResponse | undefined>
> {
  const playerId = await getPlayerId();

  if (!playerId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 401 });
  }

  const existingPlayer = await getPlayer(playerId);

  if (!existingPlayer) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const pendingGuess = await getPendingGuess(playerId);

  return NextResponse.json(pendingGuess);
}
