import { NextResponse } from "next/server";

import { clearPlayerId, getPlayerId, setPlayerId } from "@/app/lib/session";
import { createNewPlayer, getPlayer } from "@/app/lib/players/player.service";

type ProfileResponse = {
  id: string;
  score: number;
};

type ErrorResponse = {
  error: string;
};

export async function GET(): Promise<
  NextResponse<ProfileResponse | ErrorResponse>
> {
  const playerId = await getPlayerId();

  if (!playerId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 401 });
  }

  const existingPlayer = await getPlayer(playerId as string);

  if (!existingPlayer) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(existingPlayer);
}

export async function POST(): Promise<NextResponse<ProfileResponse>> {
  const player = await createNewPlayer();
  const response = NextResponse.json(player, {
    status: 201,
  });

  return setPlayerId(response, player.id);
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  return clearPlayerId(response);
}
