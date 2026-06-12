/**
 * @jest-environment node
 */

import { type Guess } from "@/app/lib/guesses/guess.types";
import { getCurrentPrice } from "@/app/lib/market-data";
import { GET } from "./route";
import {
  enqueueGuessResolution,
  getDueGuesses,
  resolveGuess,
} from "@/app/lib/guesses/guess.service";

jest.mock("@/app/lib/guesses/guess.service", () => ({
  enqueueGuessResolution: jest.fn(),
  getDueGuesses: jest.fn(),
  resolveGuess: jest.fn(),
}));

jest.mock("@/app/lib/market-data", () => ({
  getCurrentPrice: jest.fn(),
}));

const mockedGetDueGuesses = getDueGuesses as jest.MockedFunction<
  typeof getDueGuesses
>;
const mockedEnqueueGuessResolution =
  enqueueGuessResolution as jest.MockedFunction<typeof enqueueGuessResolution>;
const mockedResolveGuess = resolveGuess as jest.MockedFunction<
  typeof resolveGuess
>;
const mockedGetCurrentPrice = getCurrentPrice as jest.MockedFunction<
  typeof getCurrentPrice
>;

const dueChangedGuess: Guess = {
  createdAt: "2026-06-08T12:00:00.000Z",
  updatedAt: "2026-06-08T12:00:00.000Z",
  direction: "up",
  entryPrice: 100000,
  id: "guess-1",
  playerId: "player-1",
  resolvesAfter: "2026-06-08T12:01:00.000Z",
};

describe("GET /api/guesses/resolve", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T12:02:00.000Z"));
    mockedGetCurrentPrice.mockResolvedValue(100100);
    mockedGetDueGuesses.mockResolvedValue([dueChangedGuess]);
    mockedEnqueueGuessResolution.mockResolvedValue();
    mockedResolveGuess.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("resolves pending guesses that are due and whose price changed", async () => {
    const response = await GET();

    expect(mockedGetDueGuesses).toHaveBeenCalledWith(
      new Date("2026-06-08T12:02:00.000Z")
    );
    expect(mockedGetCurrentPrice).toHaveBeenCalledWith("BTC/USD");
    expect(mockedEnqueueGuessResolution).not.toHaveBeenCalled();
    expect(mockedResolveGuess).toHaveBeenCalledWith(dueChangedGuess, {
      price: 100100,
    });
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("OK");
  });

  it("re-enqueues due pending guesses whose price has not changed", async () => {
    mockedGetCurrentPrice.mockResolvedValue(100000);
    mockedGetDueGuesses.mockResolvedValue([dueChangedGuess]);

    const response = await GET();

    expect(mockedEnqueueGuessResolution).toHaveBeenCalledWith(dueChangedGuess);
    expect(mockedResolveGuess).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("does nothing when no guesses are due", async () => {
    mockedGetDueGuesses.mockResolvedValue([]);

    const response = await GET();

    expect(mockedEnqueueGuessResolution).not.toHaveBeenCalled();
    expect(mockedResolveGuess).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("returns 500 when resolving guesses fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedGetDueGuesses.mockRejectedValue(new Error("database unavailable"));

    const response = await GET();

    expect(response.status).toBe(500);
    await expect(response.text()).resolves.toBe("Internal Server Error");

    consoleErrorSpy.mockRestore();
  });
});
