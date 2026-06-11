/**
 * @jest-environment node
 */

import dynamoose from "dynamoose";

import {
  createGuess,
  getGuess,
  getGuesses,
  resolveGuessAndUpdatePlayerScore,
  updateGuess,
} from "./guess.repository";
import { Guess, GuessKey } from "./guess.types";
import { GuessModel } from "./guess.model";
import { PlayerModel } from "../players/player.model";

const mockCondition = {
  eq: jest.fn(),
  where: jest.fn(),
};

jest.mock("dynamoose", () => ({
  __esModule: true,
  default: {
    Condition: jest.fn(() => mockCondition),
    transaction: jest.fn(),
  },
}));

jest.mock("./guess.model", () => ({
  GuessModel: {
    create: jest.fn(),
    get: jest.fn(),
    query: jest.fn(),
    scan: jest.fn(),
    transaction: {
      update: jest.fn(),
    },
    update: jest.fn(),
  },
}));

jest.mock("../players/player.model", () => ({
  PlayerModel: {
    transaction: {
      update: jest.fn(),
    },
  },
}));

const mockedDynamoose = dynamoose as jest.Mocked<typeof dynamoose>;
const mockedGuessModel = GuessModel as jest.Mocked<typeof GuessModel>;
const mockedPlayerModel = PlayerModel as jest.Mocked<typeof PlayerModel>;

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

const query = {
  eq: jest.fn(),
  exec: jest.fn(),
  filter: jest.fn(),
};

const scan = {
  eq: jest.fn(),
  exec: jest.fn(),
};

describe("guess repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T12:02:00.000Z"));
    jest.spyOn(crypto, "randomUUID").mockReturnValue("guess-1");

    query.eq.mockReturnValue(query);
    query.filter.mockReturnValue(query);
    query.exec.mockResolvedValue([guess]);
    scan.eq.mockReturnValue(scan);
    scan.exec.mockResolvedValue([guess]);

    mockedGuessModel.query.mockReturnValue(
      query as unknown as ReturnType<typeof GuessModel.query>
    );
    mockedGuessModel.scan.mockReturnValue(
      scan as unknown as ReturnType<typeof GuessModel.scan>
    );
    mockedGuessModel.get.mockResolvedValue(guess);
    mockedGuessModel.create.mockImplementation(async (item) => item);
    mockedGuessModel.update.mockResolvedValue(guess);
    mockedGuessModel.transaction.update.mockResolvedValue("guess-update");
    mockedPlayerModel.transaction.update.mockResolvedValue("player-update");
    mockCondition.where.mockReturnValue(mockCondition);
    mockCondition.eq.mockReturnValue(mockCondition);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("gets a guess with the full DynamoDB composite key", async () => {
    await expect(getGuess(guessKey)).resolves.toEqual(guess);

    expect(mockedGuessModel.get).toHaveBeenCalledWith(guessKey);
  });

  it("queries a player's pending guesses with Dynamoose syntax", async () => {
    await expect(
      getGuesses({ playerId: "player-1", status: "pending" })
    ).resolves.toEqual([guess]);

    expect(mockedGuessModel.query).toHaveBeenCalledWith("playerId");
    expect(query.eq).toHaveBeenNthCalledWith(1, "player-1");
    expect(query.filter).toHaveBeenCalledWith("status");
    expect(query.eq).toHaveBeenNthCalledWith(2, "pending");
    expect(query.exec).toHaveBeenCalledWith();
  });

  it("scans pending guesses when no player id is supplied", async () => {
    await expect(getGuesses({ status: "pending" })).resolves.toEqual([guess]);

    expect(mockedGuessModel.scan).toHaveBeenCalledWith("status");
    expect(scan.eq).toHaveBeenCalledWith("pending");
    expect(scan.exec).toHaveBeenCalledWith();
  });

  it("creates a guess with the Dynamoose model", async () => {
    await expect(
      createGuess({
        direction: "up",
        entryPrice: 100000,
        playerId: "player-1",
        resolvesAfter: new Date("2026-06-08T12:03:00.000Z"),
        status: "pending",
      })
    ).resolves.toEqual({
      ...guess,
      createdAt: "2026-06-08T12:02:00.000Z",
      resolvesAfter: "2026-06-08T12:03:00.000Z",
      updatedAt: "2026-06-08T12:02:00.000Z",
    });

    expect(mockedGuessModel.create).toHaveBeenCalledWith({
      createdAt: "2026-06-08T12:02:00.000Z",
      direction: "up",
      entryPrice: 100000,
      id: "guess-1",
      playerId: "player-1",
      resolvesAfter: "2026-06-08T12:03:00.000Z",
      status: "pending",
      updatedAt: "2026-06-08T12:02:00.000Z",
    });
  });

  it("updates a guess with the full DynamoDB composite key", async () => {
    await updateGuess(guessKey, {
      resolvedAt: "2026-06-08T12:02:00.000Z",
      resolvedPrice: 100100,
      status: "resolved",
    });

    expect(mockedGuessModel.update).toHaveBeenCalledWith(guessKey, {
      resolvedAt: "2026-06-08T12:02:00.000Z",
      resolvedPrice: 100100,
      status: "resolved",
      updatedAt: "2026-06-08T12:02:00.000Z",
    });
  });

  it("resolves a guess and player score in one Dynamoose transaction", async () => {
    await resolveGuessAndUpdatePlayerScore(guessKey, {
      resolvedAt: "2026-06-08T12:02:00.000Z",
      resolvedPrice: 100100,
      score: 4,
      status: "resolved",
    });

    expect(mockedGuessModel.transaction.update).toHaveBeenCalledWith(
      guessKey,
      {
        resolvedAt: "2026-06-08T12:02:00.000Z",
        resolvedPrice: 100100,
        status: "resolved",
        updatedAt: "2026-06-08T12:02:00.000Z",
      },
      { condition: mockCondition }
    );
    expect(mockCondition.where).toHaveBeenCalledWith("status");
    expect(mockCondition.eq).toHaveBeenCalledWith("pending");
    expect(mockedPlayerModel.transaction.update).toHaveBeenCalledWith(
      { id: "player-1" },
      {
        score: 4,
        updatedAt: "2026-06-08T12:02:00.000Z",
      }
    );
    expect(mockedDynamoose.transaction).toHaveBeenCalledWith([
      expect.any(Promise),
      expect.any(Promise),
    ]);
  });
});
