/**
 * @jest-environment node
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { POST } from "./route";
import {
  createPendingGuess,
  getPendingGuess,
} from "@/app/lib/guesses/guess.service";
import { getCurrentPrice } from "@/app/lib/market-data";
import { getPlayer } from "@/app/lib/players/player.service";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@/app/lib/guesses/guess.service", () => ({
  createPendingGuess: jest.fn(),
  getPendingGuess: jest.fn(),
}));

jest.mock("@/app/lib/market-data", () => ({
  getCurrentPrice: jest.fn(),
}));

jest.mock("@/app/lib/players/player.service", () => ({
  getPlayer: jest.fn(),
}));

const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockedCreatePendingGuess = createPendingGuess as jest.MockedFunction<
  typeof createPendingGuess
>;
const mockedGetPendingGuess = getPendingGuess as jest.MockedFunction<
  typeof getPendingGuess
>;
const mockedGetCurrentPrice = getCurrentPrice as jest.MockedFunction<
  typeof getCurrentPrice
>;
const mockedGetPlayer = getPlayer as jest.MockedFunction<typeof getPlayer>;

const player = {
  createdAt: "2026-06-08T12:00:00.000Z",
  id: "player-1",
  score: 2,
  updatedAt: "2026-06-08T12:00:00.000Z",
};

const pendingGuess = {
  createdAt: "2026-06-08T12:00:00.000Z",
  direction: "up" as const,
  entryPrice: 100000,
  id: "guess-1",
  playerId: "player-1",
  resolvesAfter: "2026-06-08T12:01:00.000Z",
  status: "pending" as const,
};

const createRequest = (body: unknown) =>
  new NextRequest("http://localhost/api/guesses", {
    body: JSON.stringify(body),
    method: "POST",
  });

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

describe("POST /api/guesses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookieStore("player-1");
    mockedGetPlayer.mockResolvedValue(player);
    mockedGetPendingGuess.mockResolvedValue(null);
    mockedGetCurrentPrice.mockResolvedValue(100000);
    mockedCreatePendingGuess.mockResolvedValue(pendingGuess);
  });

  it("returns 401 when the player cookie is missing", async () => {
    mockCookieStore();

    const response = await POST(createRequest({ direction: "up" }));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Missing player id",
    });
    expect(mockedGetPlayer).not.toHaveBeenCalled();
  });

  it("returns 404 when the cookie points to a missing player", async () => {
    mockedGetPlayer.mockResolvedValue(null);

    const response = await POST(createRequest({ direction: "up" }));

    expect(mockedGetPlayer).toHaveBeenCalledWith("player-1");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Player not found",
    });
  });

  it("returns 400 for an invalid direction", async () => {
    const response = await POST(createRequest({ direction: "sideways" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid guess direction",
    });
    expect(mockedCreatePendingGuess).not.toHaveBeenCalled();
  });

  it("returns 400 when extra client-supplied fields are present", async () => {
    const response = await POST(
      createRequest({
        direction: "up",
        scoreDelta: 1,
      })
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid guess direction",
    });
    expect(mockedCreatePendingGuess).not.toHaveBeenCalled();
  });

  it("returns 409 when the player already has a pending guess", async () => {
    mockedGetPendingGuess.mockResolvedValue(pendingGuess);

    const response = await POST(createRequest({ direction: "up" }));

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Pending guess already exists",
    });
    expect(mockedGetCurrentPrice).not.toHaveBeenCalled();
    expect(mockedCreatePendingGuess).not.toHaveBeenCalled();
  });

  it("returns 503 when the backend price is unavailable", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedGetCurrentPrice.mockRejectedValue(new Error("price unavailable"));

    const response = await POST(createRequest({ direction: "up" }));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "Price unavailable",
    });
    expect(mockedCreatePendingGuess).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("creates a pending guess from the backend price", async () => {
    const response = await POST(createRequest({ direction: "down" }));

    expect(mockedGetPendingGuess).toHaveBeenCalledWith("player-1");
    expect(mockedGetCurrentPrice).toHaveBeenCalledWith("BTC/USD");
    expect(mockedCreatePendingGuess).toHaveBeenCalledWith({
      direction: "down",
      entryPrice: 100000,
      playerId: "player-1",
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual(pendingGuess);
  });
});
