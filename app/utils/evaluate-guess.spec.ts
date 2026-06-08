import { evaluateGuess } from "./evaluate-guess";

describe("evaluateGuess", () => {
  it("returns won when the user guesses up and the price increases", () => {
    expect(
      evaluateGuess({
        currentPrice: 101,
        guess: {
          snapshotPrice: 100,
          direction: "up",
        },
      })
    ).toBe("won");
  });

  it("returns lost when the user guesses up and the price decreases", () => {
    expect(
      evaluateGuess({
        currentPrice: 99,
        guess: {
          snapshotPrice: 100,
          direction: "up",
        },
      })
    ).toBe("lost");
  });

  it("returns won when the user guesses down and the price decreases", () => {
    expect(
      evaluateGuess({
        currentPrice: 99,
        guess: {
          snapshotPrice: 100,
          direction: "down",
        },
      })
    ).toBe("won");
  });

  it("returns lost when the user guesses down and the price increases", () => {
    expect(
      evaluateGuess({
        currentPrice: 101,
        guess: {
          snapshotPrice: 100,
          direction: "down",
        },
      })
    ).toBe("lost");
  });

  it("returns pending when the price is unchanged", () => {
    expect(
      evaluateGuess({
        currentPrice: 100,
        guess: {
          snapshotPrice: 100,
          direction: "up",
        },
      })
    ).toBe("pending");

    expect(
      evaluateGuess({
        currentPrice: 100,
        guess: {
          snapshotPrice: 100,
          direction: "down",
        },
      })
    ).toBe("pending");
  });
});
