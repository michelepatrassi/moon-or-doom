import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "player-id";

export const getPlayerId = async (): Promise<string | undefined> => {
  const cookieStore = await cookies();
  const playerId = cookieStore.get(COOKIE_NAME)?.value;

  return playerId;
};

export const setPlayerId = <T>(
  response: NextResponse<T>,
  playerId: string
): NextResponse<T> => {
  response.cookies.set({
    name: COOKIE_NAME,
    value: playerId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
};
