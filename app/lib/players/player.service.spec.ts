/**
 * @jest-environment node
 */

import { createNewPlayer, computeScore, getPlayer } from "./player.service";
import { createPlayer, getPlayerById } from "./player.repository";
import { Player } from "./player.types";

jest.mock("./player.repository", () => ({
  createPlayer: jest.fn(),
  getPlayerById: jest.fn(),
}));

const mockedCreatePlayer = createPlayer as jest.MockedFunction<
  typeof createPlayer
>;
const mockedGetPlayerById = getPlayerById as jest.MockedFunction<
  typeof getPlayerById
>;

const player: Player = {
  createdAt: "2026-06-08T12:00:00.000Z",
  id: "player-1",
  score: 3,
  updatedAt: "2026-06-08T12:00:00.000Z",
};

describe("player service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedGetPlayerById.mockResolvedValue(player);
    mockedCreatePlayer.mockResolvedValue(player);
  });

  it("gets a player by id", async () => {
    await expect(getPlayer("player-1")).resolves.toEqual(player);

    expect(mockedGetPlayerById).toHaveBeenCalledWith("player-1");
  });

  it("creates a new player with a zero score", async () => {
    await expect(createNewPlayer()).resolves.toEqual(player);

    expect(mockedCreatePlayer).toHaveBeenCalledWith({ score: 0 });
  });

  it("increments the score for a won guess", () => {
    expect(computeScore(3, "won")).toBe(4);
  });

  it("decrements the score for a lost guess", () => {
    expect(computeScore(3, "lost")).toBe(2);
  });

  it("does not decrement below zero", () => {
    expect(computeScore(0, "lost")).toBe(0);
  });
});
