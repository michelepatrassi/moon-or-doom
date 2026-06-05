import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useMoonOrDoomGame } from "./use-moon-or-doom-game";

const GameProbe = () => {
  const [currentPrice, setCurrentPrice] = React.useState<number | undefined>(
    100,
  );
  const { finishCountdown, game, placeGuess } = useMoonOrDoomGame(currentPrice);

  return (
    <div>
      <p data-testid="phase">{game.phase}</p>
      <p data-testid="result">{game.result ?? "none"}</p>
      <p data-testid="score">{game.score}</p>

      <button onClick={() => placeGuess("up")} type="button">
        guess up
      </button>
      <button onClick={finishCountdown} type="button">
        finish countdown
      </button>
      <button onClick={() => setCurrentPrice(100)} type="button">
        price unchanged
      </button>
      <button onClick={() => setCurrentPrice(101)} type="button">
        price higher
      </button>
    </div>
  );
};

describe("useMoonOrDoomGame", () => {
  it("starts ready with no result and a score of zero", () => {
    render(<GameProbe />);

    expect(screen.getByTestId("phase")).toHaveTextContent("ready");
    expect(screen.getByTestId("result")).toHaveTextContent("none");
    expect(screen.getByTestId("score")).toHaveTextContent("0");
  });

  it("waits for a price move after the countdown ends unchanged", async () => {
    render(<GameProbe />);

    fireEvent.click(screen.getByRole("button", { name: "guess up" }));
    expect(screen.getByTestId("phase")).toHaveTextContent("countingDown");

    fireEvent.click(screen.getByRole("button", { name: "finish countdown" }));
    expect(screen.getByTestId("phase")).toHaveTextContent(
      "waitingForPriceToMove",
    );
    expect(screen.getByTestId("result")).toHaveTextContent("none");

    fireEvent.click(screen.getByRole("button", { name: "price unchanged" }));
    expect(screen.getByTestId("phase")).toHaveTextContent(
      "waitingForPriceToMove",
    );

    fireEvent.click(screen.getByRole("button", { name: "price higher" }));
    await waitFor(() => {
      expect(screen.getByTestId("phase")).toHaveTextContent("resolved");
    });
    expect(screen.getByTestId("result")).toHaveTextContent("won");
    expect(screen.getByTestId("score")).toHaveTextContent("1");
  });

  it("resolves immediately if the price already moved when the countdown ends", () => {
    render(<GameProbe />);

    fireEvent.click(screen.getByRole("button", { name: "guess up" }));
    fireEvent.click(screen.getByRole("button", { name: "price higher" }));
    expect(screen.getByTestId("phase")).toHaveTextContent("countingDown");

    fireEvent.click(screen.getByRole("button", { name: "finish countdown" }));

    expect(screen.getByTestId("phase")).toHaveTextContent("resolved");
    expect(screen.getByTestId("result")).toHaveTextContent("won");
    expect(screen.getByTestId("score")).toHaveTextContent("1");
  });
});
