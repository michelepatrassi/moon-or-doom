import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "player-id";
const COOKIE_OPTIONS = {
  name: COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

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
    ...COOKIE_OPTIONS,
    value: playerId,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
};

export const clearPlayerId = <T>(
  response: NextResponse<T>
): NextResponse<T> => {
  response.cookies.set({
    ...COOKIE_OPTIONS,
    value: "",
    sameSite: "lax",
    maxAge: 0,
  });

  return response;
};
