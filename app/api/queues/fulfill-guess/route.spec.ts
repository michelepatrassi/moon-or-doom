/**
 * @jest-environment node
 */

import { type Guess, type GuessKey } from "@/app/lib/guesses/guess.types";
import {
  enqueueGuessResolution,
  getGuess,
  resolveGuess,
} from "@/app/lib/guesses/guess.service";
import { getCurrentPrice } from "@/app/lib/market-data";
import { POST } from "./route";

jest.mock("@/app/lib/queue", () => ({
  handleCallback:
    <T>(handler: (payload: T, metadata: { messageId: string }) => void) =>
    async (payload: T) =>
      handler(payload, { messageId: "message-1" }),
}));

jest.mock("@/app/lib/guesses/guess.service", () => ({
  enqueueGuessResolution: jest.fn(),
  getGuess: jest.fn(),
  resolveGuess: jest.fn(),
}));

jest.mock("@/app/lib/market-data", () => ({
  getCurrentPrice: jest.fn(),
}));

const mockedEnqueueGuessResolution =
  enqueueGuessResolution as jest.MockedFunction<typeof enqueueGuessResolution>;
const mockedGetGuess = getGuess as jest.MockedFunction<typeof getGuess>;
const mockedResolveGuess = resolveGuess as jest.MockedFunction<
  typeof resolveGuess
>;
const mockedGetCurrentPrice = getCurrentPrice as jest.MockedFunction<
  typeof getCurrentPrice
>;

const guessKey: GuessKey = {
  id: "guess-1",
  playerId: "player-1",
};

const pendingGuess: Guess = {
  ...guessKey,
  createdAt: "2026-06-08T12:00:00.000Z",
  updatedAt: "2026-06-08T12:00:00.000Z",
  direction: "up",
  entryPrice: 100000,
  resolvesAfter: "2026-06-08T12:01:00.000Z",
  status: "pending",
};

describe("POST /api/queues/fulfill-guess", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetGuess.mockResolvedValue(pendingGuess);
    mockedGetCurrentPrice.mockResolvedValue(100100);
    mockedEnqueueGuessResolution.mockResolvedValue();
    mockedResolveGuess.mockResolvedValue();
  });

  it("resolves a pending guess when the price changed", async () => {
    await POST(guessKey);

    expect(mockedGetGuess).toHaveBeenCalledWith(guessKey);
    expect(mockedGetCurrentPrice).toHaveBeenCalledWith("BTC/USD");
    expect(mockedResolveGuess).toHaveBeenCalledWith(pendingGuess, {
      price: 100100,
    });
    expect(mockedEnqueueGuessResolution).not.toHaveBeenCalled();
  });

  it("re-enqueues a pending guess when the price has not changed", async () => {
    mockedGetCurrentPrice.mockResolvedValue(100000);

    await POST(guessKey);

    expect(mockedEnqueueGuessResolution).toHaveBeenCalledWith(guessKey);
    expect(mockedResolveGuess).not.toHaveBeenCalled();
  });

  it("acknowledges missing guesses without retrying stale queue messages", async () => {
    mockedGetGuess.mockResolvedValue(undefined);

    await POST(guessKey);

    expect(mockedGetCurrentPrice).not.toHaveBeenCalled();
    expect(mockedEnqueueGuessResolution).not.toHaveBeenCalled();
    expect(mockedResolveGuess).not.toHaveBeenCalled();
  });

  it("acknowledges already resolved guesses without applying resolution twice", async () => {
    mockedGetGuess.mockResolvedValue({
      ...pendingGuess,
      status: "resolved",
    });

    await POST(guessKey);

    expect(mockedGetCurrentPrice).not.toHaveBeenCalled();
    expect(mockedEnqueueGuessResolution).not.toHaveBeenCalled();
    expect(mockedResolveGuess).not.toHaveBeenCalled();
  });
});
