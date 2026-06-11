/**
 * @jest-environment node
 */

import { createPlayer, getPlayerById, updatePlayer } from "./player.repository";
import { PlayerModel } from "./player.model";
import { Player } from "./player.types";

jest.mock("./player.model", () => ({
  PlayerModel: {
    create: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
  },
}));

const mockedPlayerModel = PlayerModel as jest.Mocked<typeof PlayerModel>;

const player: Player = {
  createdAt: "2026-06-08T12:00:00.000Z",
  id: "player-1",
  score: 3,
  updatedAt: "2026-06-08T12:00:00.000Z",
};

describe("player repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-08T12:02:00.000Z"));
    jest.spyOn(crypto, "randomUUID").mockReturnValue("player-1");

    mockedPlayerModel.get.mockResolvedValue(player);
    mockedPlayerModel.create.mockImplementation(async (item) => item);
    mockedPlayerModel.update.mockResolvedValue(player);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("gets a player with the Dynamoose model", async () => {
    await expect(getPlayerById("player-1")).resolves.toEqual(player);

    expect(mockedPlayerModel.get).toHaveBeenCalledWith("player-1");
  });

  it("creates a player with the Dynamoose model", async () => {
    await expect(createPlayer({ score: 0 })).resolves.toEqual({
      createdAt: "2026-06-08T12:02:00.000Z",
      id: "player-1",
      score: 0,
      updatedAt: "2026-06-08T12:02:00.000Z",
    });

    expect(mockedPlayerModel.create).toHaveBeenCalledWith({
      createdAt: "2026-06-08T12:02:00.000Z",
      id: "player-1",
      score: 0,
      updatedAt: "2026-06-08T12:02:00.000Z",
    });
  });

  it("updates whichever optional player fields are supplied", async () => {
    await updatePlayer("player-1", {
      latestGuessId: "guess-1",
      score: 4,
    });

    expect(mockedPlayerModel.update).toHaveBeenCalledWith(
      { id: "player-1" },
      {
        latestGuessId: "guess-1",
        score: 4,
        updatedAt: "2026-06-08T12:02:00.000Z",
      }
    );
  });
});
