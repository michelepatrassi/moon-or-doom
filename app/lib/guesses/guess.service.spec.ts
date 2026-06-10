/**
 * @jest-environment node
 */

import { send } from "@/app/lib/queue";
import {
  getGuess,
  resolveGuess,
  enqueueGuessResolution,
} from "./guess.service";
import { getGuess as repoGetGuess, updateGuess } from "./guess.repository";
import { type Guess, type GuessKey } from "./guess.types";

jest.mock("@/app/lib/queue", () => ({
  send: jest.fn(),
}));

jest.mock("./guess.repository", () => ({
  createGuess: jest.fn(),
  getGuess: jest.fn(),
  getGuesses: jest.fn(),
  updateGuess: jest.fn(),
}));

const mockedSend = send as jest.MockedFunction<typeof send>;
const mockedRepoGetGuess = repoGetGuess as jest.MockedFunction<
  typeof repoGetGuess
>;
const mockedUpdateGuess = updateGuess as jest.MockedFunction<
  typeof updateGuess
>;

const guessKey: GuessKey = {
  id: "guess-1",
  playerId: "player-1",
};

const guess: Guess = {
  ...guessKey,
  createdAt: "2026-06-08T12:00:00.000Z",
  direction: "up",
  entryPrice: 100000,
  resolvesAt: "2026-06-08T12:01:00.000Z",
  status: "pending",
};

describe("guess service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSend.mockResolvedValue({ messageId: "message-1" });
    mockedRepoGetGuess.mockResolvedValue(guess);
    mockedUpdateGuess.mockResolvedValue();
  });

  it("gets a guess by its DynamoDB key", async () => {
    await expect(getGuess(guessKey)).resolves.toEqual(guess);

    expect(mockedRepoGetGuess).toHaveBeenCalledWith(guessKey);
  });

  it("resolves a guess by its DynamoDB key", async () => {
    await resolveGuess(guessKey);

    expect(mockedUpdateGuess).toHaveBeenCalledWith(guessKey, {
      status: "resolved",
    });
  });

  it("enqueues only the guess key even when given a full guess object", async () => {
    await enqueueGuessResolution(guess);

    expect(mockedSend).toHaveBeenCalledWith("guess", guessKey, {
      delaySeconds: 1,
    });
  });
});
