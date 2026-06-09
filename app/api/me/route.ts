import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createPlayer, getPlayer } from "@/app/lib/models/players";

type ProfileResponse = {
  id: string;
  score: number;
};

type ErrorResponse = {
  error: string;
};

const COOKIE_NAME = "player-id";

const getProfileResponse = ({
  id,
  score,
}: ProfileResponse): ProfileResponse => ({
  id,
  score,
});

export async function GET(): Promise<
  NextResponse<ProfileResponse | ErrorResponse>
> {
  const cookieStore = await cookies();
  const existingId = cookieStore.get(COOKIE_NAME)?.value;

  if (!existingId) {
    return NextResponse.json({ error: "Missing player id" }, { status: 401 });
  }

  const existingPlayer = await getPlayer(existingId);

  if (!existingPlayer) {
    return NextResponse.json({ error: "Player not found" }, { status: 404 });
  }

  return NextResponse.json(getProfileResponse(existingPlayer));
}

export async function POST(): Promise<NextResponse<ProfileResponse>> {
  const id = crypto.randomUUID();
  const player = await createPlayer(id);
  const response = NextResponse.json(getProfileResponse(player), {
    status: 201,
  });

  response.cookies.set({
    name: COOKIE_NAME,
    value: id,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
