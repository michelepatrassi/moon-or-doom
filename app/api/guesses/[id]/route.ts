import { NextResponse } from "next/server";

import { getGuess } from "@/app/lib/guesses/guess.service";
import { Guess } from "@/app/lib/guesses/guess.types";
import { getPlayer } from "@/app/lib/players/player.service";
import { getPlayerId } from "@/app/lib/session";

type ErrorResponse = {
  error: string;
};

type GuessRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: GuessRouteContext
): Promise<NextResponse<Guess | ErrorResponse>> {
  const playerId = await getPlayerId();

  if (!playerId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 401 });
  }

  const player = await getPlayer(playerId);

  if (!player) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  const { id } = await params;
  const guess = await getGuess({ id, playerId });

  if (!guess) {
    return NextResponse.json({ error: "Guess not found" }, { status: 404 });
  }

  return NextResponse.json(guess);
}
