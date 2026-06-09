/**
 * @jest-environment node
 */

import {
  getPendingGuesses,
  updateGuess,
  type Guess,
} from "@/app/lib/models/guesses";
import { getCurrentPrice } from "@/app/lib/market-data";
import { GET } from "./resolve";

jest.mock("@/app/lib/models/guesses", () => ({
  getPendingGuesses: jest.fn(),
  updateGuess: jest.fn(),
}));

jest.mock("@/app/lib/market-data", () => ({
  getCurrentPrice: jest.fn(),
}));

const mockedGetPendingGuesses = getPendingGuesses as jest.MockedFunction<
  typeof getPendingGuesses
>;
const mockedUpdateGuess = updateGuess as jest.MockedFunction<
  typeof updateGuess
>;
const mockedGetCurrentPrice = getCurrentPrice as jest.MockedFunction<
  typeof getCurrentPrice
>;

const dueChangedGuess: Guess = {
  createdAt: "2026-06-08T12:00:00.000Z",
  direction: "up",
  entryPrice: 100000,
  id: "guess-1",
  playerId: "player-1",
  resolvesAt: "2026-06-08T12:01:00.000Z",
  status: "pending",
};

describe("GET /api/guesses/resolve", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T12:02:00.000Z"));
    mockedGetCurrentPrice.mockResolvedValue(100100);
    mockedGetPendingGuesses.mockResolvedValue([dueChangedGuess]);
    mockedUpdateGuess.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves pending guesses that are due and whose price changed", async () => {
    const response = await GET(
      new Request("http://localhost/api/guesses/resolve")
    );

    expect(mockedGetPendingGuesses).toHaveBeenCalledTimes(1);
    expect(mockedGetCurrentPrice).toHaveBeenCalledWith("BTC/USD");
    expect(mockedUpdateGuess).toHaveBeenCalledWith({
      ...dueChangedGuess,
      status: "resolved",
    });
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("OK");
  });

  it("keeps pending guesses open when they are not due or the price has not changed", async () => {
    mockedGetCurrentPrice.mockResolvedValue(100000);
    mockedGetPendingGuesses.mockResolvedValue([
      dueChangedGuess,
      {
        ...dueChangedGuess,
        entryPrice: 99900,
        id: "guess-2",
        resolvesAt: "2026-06-08T12:03:00.000Z",
      },
    ]);

    const response = await GET(
      new Request("http://localhost/api/guesses/resolve")
    );

    expect(mockedUpdateGuess).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("returns 500 when resolving guesses fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedGetPendingGuesses.mockRejectedValue(
      new Error("database unavailable")
    );

    const response = await GET(
      new Request("http://localhost/api/guesses/resolve")
    );

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Internal Server Error");

    consoleErrorSpy.mockRestore();
  });
});
