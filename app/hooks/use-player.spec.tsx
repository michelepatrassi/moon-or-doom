import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { usePlayer } from "./use-player";

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
  const { createPlayer, error, loading, player } = usePlayer();

  return (
    <div>
      <p data-testid="error">{error ?? "none"}</p>
      <p data-testid="loading">{loading ? "loading" : "done"}</p>
      <p data-testid="player-id">{player?.id ?? "none"}</p>
      <p data-testid="score">{player?.score ?? "none"}</p>
      <button onClick={createPlayer}>create player</button>
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

  it("does not create a player automatically when the profile request returns 401", async () => {
    mockedAxios.get.mockRejectedValue(createAxiosError(401));

    render(<PlayerProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("done");
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/me");
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(screen.getByTestId("player-id")).toHaveTextContent("none");
    expect(screen.getByTestId("score")).toHaveTextContent("none");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });

  it("sets an error when the profile request returns 404", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(createAxiosError(404));

    render(<PlayerProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("done");
    });

    expect(mockedAxios.get).toHaveBeenCalledWith("/api/me");
    expect(mockedAxios.post).not.toHaveBeenCalled();
    expect(screen.getByTestId("player-id")).toHaveTextContent("none");
    expect(screen.getByTestId("score")).toHaveTextContent("none");
    expect(screen.getByTestId("error")).toHaveTextContent(
      "Failed to fetch player data"
    );

    consoleErrorSpy.mockRestore();
  });

  it("creates a player when createPlayer is called", async () => {
    mockedAxios.get.mockRejectedValue(createAxiosError(401));
    mockedAxios.post.mockResolvedValue({
      data: {
        ...player,
        id: "created-player",
        score: 0,
      },
    });

    render(<PlayerProbe />);

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("done");
    });

    fireEvent.click(screen.getByRole("button", { name: "create player" }));

    await waitFor(() => {
      expect(screen.getByTestId("player-id")).toHaveTextContent(
        "created-player"
      );
    });

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/me");
    expect(screen.getByTestId("score")).toHaveTextContent("0");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });
});
