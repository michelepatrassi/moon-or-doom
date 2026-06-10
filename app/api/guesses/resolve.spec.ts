/**
 * @jest-environment node
 */

import { type Guess } from "@/app/lib/guesses/guess.types";
import { getCurrentPrice } from "@/app/lib/market-data";
import { GET } from "./resolve";
import {
  getPendingGuesses,
  resolveGuess,
} from "@/app/lib/guesses/guess.service";

jest.mock("@/app/lib/guesses/guess.service", () => ({
  getPendingGuesses: jest.fn(),
  resolveGuess: jest.fn(),
}));

jest.mock("@/app/lib/market-data", () => ({
  getCurrentPrice: jest.fn(),
}));

const mockedGetPendingGuesses = getPendingGuesses as jest.MockedFunction<
  typeof getPendingGuesses
>;
const mockedResolveGuess = resolveGuess as jest.MockedFunction<
  typeof resolveGuess
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
    mockedResolveGuess.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves pending guesses that are due and whose price changed", async () => {
    const response = await GET();

    expect(mockedGetPendingGuesses).toHaveBeenCalledTimes(1);
    expect(mockedGetCurrentPrice).toHaveBeenCalledWith("BTC/USD");
    expect(mockedResolveGuess).toHaveBeenCalledWith("guess-1");
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

    const response = await GET();

    expect(mockedResolveGuess).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("returns 500 when resolving guesses fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedGetPendingGuesses.mockRejectedValue(
      new Error("database unavailable")
    );

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Internal Server Error");

    consoleErrorSpy.mockRestore();
  });
});
