/**
 * @jest-environment node
 */

import { GET } from "./route";
import { getGuess } from "@/app/lib/guesses/guess.service";
import { getPlayer } from "@/app/lib/players/player.service";
import { getPlayerId } from "@/app/lib/session";

jest.mock("@/app/lib/guesses/guess.service", () => ({
  getGuess: jest.fn(),
}));

jest.mock("@/app/lib/players/player.service", () => ({
  getPlayer: jest.fn(),
}));

jest.mock("@/app/lib/session", () => ({
  getPlayerId: jest.fn(),
}));

const mockedGetGuess = getGuess as jest.MockedFunction<typeof getGuess>;
const mockedGetPlayer = getPlayer as jest.MockedFunction<typeof getPlayer>;
const mockedGetPlayerId = getPlayerId as jest.MockedFunction<
  typeof getPlayerId
>;

const player = {
  createdAt: "2026-06-08T12:00:00.000Z",
  id: "player-1",
  score: 2,
  updatedAt: "2026-06-08T12:00:00.000Z",
};

const guess = {
  createdAt: "2026-06-08T12:00:00.000Z",
  direction: "up" as const,
  entryPrice: 100000,
  id: "guess-1",
  playerId: "player-1",
  resolvesAfter: "2026-06-08T12:01:00.000Z",
  status: "pending" as const,
  updatedAt: "2026-06-08T12:00:00.000Z",
};

const createContext = (id = "guess-1") => ({
  params: Promise.resolve({ id }),
});

describe("GET /api/guesses/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetPlayerId.mockResolvedValue("player-1");
    mockedGetPlayer.mockResolvedValue(player);
    mockedGetGuess.mockResolvedValue(guess);
  });

  it("returns 401 when the player cookie is missing", async () => {
    mockedGetPlayerId.mockResolvedValue(undefined);

    const response = await GET(
      new Request("http://localhost/api/guesses/guess-1"),
      createContext()
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Missing player id",
    });
    expect(mockedGetPlayer).not.toHaveBeenCalled();
    expect(mockedGetGuess).not.toHaveBeenCalled();
  });

  it("returns 404 when the cookie points to a missing player", async () => {
    mockedGetPlayer.mockResolvedValue(undefined);

    const response = await GET(
      new Request("http://localhost/api/guesses/guess-1"),
      createContext()
    );

    expect(mockedGetPlayer).toHaveBeenCalledWith("player-1");
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Player not found",
    });
    expect(mockedGetGuess).not.toHaveBeenCalled();
  });

  it("returns 404 when the guess is not found", async () => {
    mockedGetGuess.mockResolvedValue(undefined);

    const response = await GET(
      new Request("http://localhost/api/guesses/missing-guess"),
      createContext("missing-guess")
    );

    expect(mockedGetGuess).toHaveBeenCalledWith({
      id: "missing-guess",
      playerId: "player-1",
    });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: "Guess not found",
    });
  });

  it("returns the guess for the current player", async () => {
    const response = await GET(
      new Request("http://localhost/api/guesses/guess-1"),
      createContext()
    );

    expect(mockedGetGuess).toHaveBeenCalledWith({
      id: "guess-1",
      playerId: "player-1",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(guess);
  });
});
