/**
 * @jest-environment node
 */

import { send } from "@/app/lib/queue";
import {
  createPendingGuessForPlayer,
  evaluateGuess,
  getGuess,
  resolveGuess,
  enqueueGuessResolution,
} from "./guess.service";
import {
  createGuess as repoCreateGuess,
  getGuess as repoGetGuess,
  resolveGuessAndUpdatePlayerScore,
} from "./guess.repository";
import { type Guess, type GuessKey } from "./guess.types";
import { getPlayer } from "../players/player.service";
import { updatePlayer } from "../players/player.repository";
import { COUNTDOWN } from "@/app/constant";

jest.mock("@/app/lib/queue", () => ({
  send: jest.fn(),
}));

jest.mock("./guess.repository", () => ({
  createGuess: jest.fn(),
  getGuess: jest.fn(),
  getPendingGuesses: jest.fn(),
  resolveGuessAndUpdatePlayerScore: jest.fn(),
}));

jest.mock("../players/player.service", () => ({
  computeScore: jest.requireActual("../players/player.service").computeScore,
  getPlayer: jest.fn(),
}));

jest.mock("../players/player.repository", () => ({
  updatePlayer: jest.fn(),
}));

const mockedSend = send as jest.MockedFunction<typeof send>;
const mockedRepoCreateGuess = repoCreateGuess as jest.MockedFunction<
  typeof repoCreateGuess
>;
const mockedRepoGetGuess = repoGetGuess as jest.MockedFunction<
  typeof repoGetGuess
>;
const mockedResolveGuessAndUpdatePlayerScore =
  resolveGuessAndUpdatePlayerScore as jest.MockedFunction<
    typeof resolveGuessAndUpdatePlayerScore
  >;
const mockedGetPlayer = getPlayer as jest.MockedFunction<typeof getPlayer>;
const mockedUpdatePlayer = updatePlayer as jest.MockedFunction<
  typeof updatePlayer
>;

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
};

describe("guess service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T12:02:00.000Z"));
    mockedSend.mockResolvedValue({ messageId: "message-1" });
    mockedRepoCreateGuess.mockResolvedValue(
      guess as Awaited<ReturnType<typeof repoCreateGuess>>
    );
    mockedRepoGetGuess.mockResolvedValue(guess);
    mockedGetPlayer.mockResolvedValue({
      id: "player-1",
      score: 3,
      createdAt: "2026-06-08T11:00:00.000Z",
      updatedAt: "2026-06-08T11:00:00.000Z",
    });
    mockedResolveGuessAndUpdatePlayerScore.mockResolvedValue();
    mockedUpdatePlayer.mockResolvedValue({
      id: "player-1",
      score: 3,
      createdAt: "2026-06-08T11:00:00.000Z",
      updatedAt: "2026-06-08T12:02:00.000Z",
      latestGuessId: "guess-1",
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("gets a guess by its DynamoDB key", async () => {
    await expect(getGuess(guessKey)).resolves.toEqual(guess);

    expect(mockedRepoGetGuess).toHaveBeenCalledWith(guessKey);
  });

  it("creates a pending guess and schedules its resolution after the countdown", async () => {
    await expect(
      createPendingGuessForPlayer({
        direction: "up",
        entryPrice: 100000,
        playerId: "player-1",
      })
    ).resolves.toEqual(guess);

    expect(mockedRepoCreateGuess).toHaveBeenCalledWith({
      direction: "up",
      entryPrice: 100000,
      playerId: "player-1",
      resolvesAfter: new Date(Date.now() + COUNTDOWN * 1000),
    });
    expect(mockedUpdatePlayer).toHaveBeenCalledWith("player-1", {
      latestGuessId: "guess-1",
    });
    expect(mockedSend).toHaveBeenCalledWith("guess", guessKey, {
      delaySeconds: COUNTDOWN,
    });
  });

  it("resolves a won guess and updates the player score", async () => {
    await resolveGuess(guessKey, { price: 100100 });

    expect(mockedResolveGuessAndUpdatePlayerScore).toHaveBeenCalledWith(
      guessKey,
      {
        resolvedAt: "2026-06-08T12:02:00.000Z",
        resolvedPrice: 100100,
        result: "won",
        score: 4,
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
    ["up", 100000, false],
  ] as const)(
    "evaluates a %s guess at %d as %s",
    (direction, price, result) => {
      expect(evaluateGuess(price, { ...guess, direction })).toBe(result);
    }
  );
});
