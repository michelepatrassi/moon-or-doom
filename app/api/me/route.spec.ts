/**
 * @jest-environment node
 */

import { cookies } from "next/headers";
import { GET, POST } from "./route";
import { createNewPlayer, getPlayer } from "@/app/lib/players/player.service";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/app/lib/players/player.service", () => ({
  createNewPlayer: jest.fn(),
  getPlayer: jest.fn(),
}));

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockedCreateNewPlayer = createNewPlayer as jest.MockedFunction<
  typeof createNewPlayer
>;
const mockedGetPlayer = getPlayer as jest.MockedFunction<typeof getPlayer>;

const existingPlayer = {
  createdAt: "2026-06-08T12:00:00.000Z",
  id: "player-1",
  score: 7,
  updatedAt: "2026-06-08T12:00:00.000Z",
};

const mockCookieStore = (playerId?: string) => {
  mockedCookies.mockResolvedValue({
    get: jest.fn(() =>
      playerId
        ? {
            name: "player-id",
            value: playerId,
          }
        : undefined
    ),
  } as unknown as Awaited<ReturnType<typeof cookies>>);
};

describe("/api/me", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 when the player cookie is missing", async () => {
    mockCookieStore();

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Missing player id",
    });
    expect(mockedGetPlayer).not.toHaveBeenCalled();
  });

  it("returns 404 when the cookie points to a missing player", async () => {
    mockCookieStore("missing-player");
    mockedGetPlayer.mockResolvedValue(null);

    const response = await GET();

    expect(mockedGetPlayer).toHaveBeenCalledWith("missing-player");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Player not found",
    });
  });

  it("returns the existing player profile", async () => {
    mockCookieStore("player-1");
    mockedGetPlayer.mockResolvedValue(existingPlayer);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(existingPlayer);
  });

  it("creates a player and sets the player cookie", async () => {
    mockedCreateNewPlayer.mockResolvedValue({
      ...existingPlayer,
      id: "00000000-0000-4000-8000-000000000000",
      score: 0,
    });

    const response = await POST();

    expect(mockedCreateNewPlayer).toHaveBeenCalledWith();
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      createdAt: "2026-06-08T12:00:00.000Z",
      id: "00000000-0000-4000-8000-000000000000",
      score: 0,
      updatedAt: "2026-06-08T12:00:00.000Z",
    });
    expect(response.headers.get("set-cookie")).toEqual(
      expect.stringContaining("player-id=00000000-0000-4000-8000-000000000000")
    );
  });
});
