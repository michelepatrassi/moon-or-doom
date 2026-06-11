/**
 * @jest-environment node
 */

import { send } from "@/app/lib/queue";
import {
  evaluateGuess,
  getGuess,
  resolveGuess,
  enqueueGuessResolution,
} from "./guess.service";
import {
  getGuess as repoGetGuess,
  resolveGuessAndUpdatePlayerScore,
} from "./guess.repository";
import { type Guess, type GuessKey } from "./guess.types";
import { getPlayer } from "../players/player.service";

jest.mock("@/app/lib/queue", () => ({
  send: jest.fn(),
}));

jest.mock("./guess.repository", () => ({
  createGuess: jest.fn(),
  getGuess: jest.fn(),
  getGuesses: jest.fn(),
  resolveGuessAndUpdatePlayerScore: jest.fn(),
}));

jest.mock("../players/player.service", () => ({
  computeScore: jest.requireActual("../players/player.service").computeScore,
  getPlayer: jest.fn(),
}));

const mockedSend = send as jest.MockedFunction<typeof send>;
const mockedRepoGetGuess = repoGetGuess as jest.MockedFunction<
  typeof repoGetGuess
>;
const mockedResolveGuessAndUpdatePlayerScore =
  resolveGuessAndUpdatePlayerScore as jest.MockedFunction<
    typeof resolveGuessAndUpdatePlayerScore
  >;
const mockedGetPlayer = getPlayer as jest.MockedFunction<typeof getPlayer>;

const guessKey: GuessKey = {
  id: "guess-1",
  playerId: "player-1",
};

const guess: Guess = {
  ...guessKey,
  createdAt: "2026-06-08T12:00:00.000Z",
  updatedAt: "2026-06-08T12:00:00.000Z",
  direction: "up",
  entryPrice: 100000,
  resolvesAfter: "2026-06-08T12:01:00.000Z",
  status: "pending",
};

describe("guess service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T12:02:00.000Z"));
    mockedSend.mockResolvedValue({ messageId: "message-1" });
    mockedRepoGetGuess.mockResolvedValue(guess);
    mockedGetPlayer.mockResolvedValue({
      id: "player-1",
      score: 3,
      createdAt: "2026-06-08T11:00:00.000Z",
      updatedAt: "2026-06-08T11:00:00.000Z",
    });
    mockedResolveGuessAndUpdatePlayerScore.mockResolvedValue();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("gets a guess by its DynamoDB key", async () => {
    await expect(getGuess(guessKey)).resolves.toEqual(guess);

    expect(mockedRepoGetGuess).toHaveBeenCalledWith(guessKey);
  });

  it("resolves a won guess and updates the player score", async () => {
    await resolveGuess(guessKey, { price: 100100 });

    expect(mockedResolveGuessAndUpdatePlayerScore).toHaveBeenCalledWith(
      guessKey,
      {
        resolvedAt: "2026-06-08T12:02:00.000Z",
        resolvedPrice: 100100,
        score: 4,
        status: "resolved",
      }
    );
  });

  it("leaves a guess pending when the price has not changed", async () => {
    await resolveGuess(guessKey, { price: 100000 });

    expect(mockedResolveGuessAndUpdatePlayerScore).not.toHaveBeenCalled();
  });

  it("enqueues only the guess key even when given a full guess object", async () => {
    await enqueueGuessResolution(guess);

    expect(mockedSend).toHaveBeenCalledWith("guess", guessKey, {
      delaySeconds: 1,
    });
  });

  it.each([
    ["up", 100100, "won"],
    ["up", 99900, "lost"],
    ["down", 99900, "won"],
    ["down", 100100, "lost"],
    ["up", 100000, "pending"],
  ] as const)(
    "evaluates a %s guess at %d as %s",
    (direction, price, result) => {
      expect(evaluateGuess(price, { ...guess, direction })).toBe(result);
    }
  );
});
