import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { usePlayer } from "./use-player";

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    isAxiosError: jest.fn((error) => Boolean(error?.isAxiosError)),
    post: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const player = {
  createdAt: "2026-06-08T12:00:00.000Z",
  id: "player-1",
  score: 3,
  updatedAt: "2026-06-08T12:00:00.000Z",
};

const createAxiosError = (status: number) => ({
  isAxiosError: true,
  response: {
    status,
  },
});

const PlayerProbe = () => {
  const { error, loading, player } = usePlayer();

  return (
    <div>
      <p data-testid="error">{error ?? "none"}</p>
      <p data-testid="loading">{loading ? "loading" : "done"}</p>
      <p data-testid="player-id">{player?.id ?? "none"}</p>
      <p data-testid="score">{player?.score ?? "none"}</p>
    </div>
  );
};

describe("usePlayer", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.post.mockReset();
  });

  it("loads the existing player profile", async () => {
    mockedAxios.get.mockResolvedValue({ data: player });

    render(<PlayerProbe />);

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("done");
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/me");
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(screen.getByTestId("player-id")).toHaveTextContent("player-1");
    expect(screen.getByTestId("score")).toHaveTextContent("3");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });

  it.each([401, 404])(
    "creates a player when the profile request returns %s",
    async (status) => {
      mockedAxios.get.mockRejectedValue(createAxiosError(status));
      mockedAxios.post.mockResolvedValue({
        data: {
          ...player,
          id: `created-after-${status}`,
          score: 0,
        },
      });

      render(<PlayerProbe />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("done");
      });

      expect(mockedAxios.get).toHaveBeenCalledWith("/api/me");
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/me");
      expect(screen.getByTestId("player-id")).toHaveTextContent(
        `created-after-${status}`
      );
      expect(screen.getByTestId("score")).toHaveTextContent("0");
      expect(screen.getByTestId("error")).toHaveTextContent("none");
    }
  );
});
