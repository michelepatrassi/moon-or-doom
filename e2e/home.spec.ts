import { expect, type Page, test } from "@playwright/test";

import { type Guess } from "@/app/lib/guesses/guess.types";
import { initialPlayer, mockApiRoutes } from "./support/api-mocks";
import { mockTickerWebSocket } from "./support/ticker-mock";

test.describe("home", () => {
  test.beforeEach(async ({ page }) => {
    await mockTickerWebSocket(page);
  });

  const expectDefaultState = async (page: Page) => {
    await expect(page.getByText("BTC/USD")).toBeVisible();
    await expect(page.getByText("LIVE")).toBeVisible();
    await expect(page.getByText("$70,123.45")).toBeVisible();
    await expect(page.getByText("NEXT 60 SECONDS")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Moon or doom?" })
    ).toBeVisible();
  };

  const expectScore = async (page: Page, score: number) => {
    await expect(page.getByLabel("Current score")).toContainText(String(score));
  };

  const createMockGuess = (overrides: Partial<Guess> = {}): Guess => {
    const now = new Date().toISOString();

    return {
      id: "guess-e2e",
      playerId: initialPlayer.id,
      direction: "up",
      entryPrice: 70123.45,
      createdAt: now,
      updatedAt: now,
      resolvesAfter: new Date(Date.now() + 60_000).toISOString(),
      ...overrides,
    };
  };

  const playerWithActiveGuess = (guess: Guess) => ({
    ...initialPlayer,
    latestGuessId: guess.id,
  });

  test("shows the default ready state when there is no current guess", async ({
    page,
  }) => {
    await mockApiRoutes(page);

    await page.goto("/");

    await expectDefaultState(page);
  });

  test("shows the default ready state when there is no player", async ({
    page,
  }) => {
    await mockApiRoutes(page, { player: null });

    await page.goto("/");

    await expectDefaultState(page);
  });

  test("shows the current player score from the API", async ({ page }) => {
    await mockApiRoutes(page, {
      player: {
        ...initialPlayer,
        score: 17,
      },
    });

    await page.goto("/");

    await expectScore(page, 17);
  });

  test("shows zero as the score when there is no player", async ({ page }) => {
    await mockApiRoutes(page, { player: null });

    await page.goto("/");

    await expectScore(page, 0);
  });

  test("shows the countdown when the player has an unresolved active guess before resolvesAfter", async ({
    page,
  }) => {
    const activeGuess = createMockGuess({
      id: "active-countdown-e2e",
      resolvesAfter: new Date(Date.now() + 60_000).toISOString(),
    });

    await mockApiRoutes(page, {
      player: playerWithActiveGuess(activeGuess),
      guesses: {
        [activeGuess.id]: activeGuess,
      },
    });

    await page.goto("/");

    await expect(page.getByText("Active guess")).toBeVisible();
    await expect(page.getByText("📈 Moon")).toBeVisible();
    await expect(page.getByText("Seconds left")).toBeVisible();
  });

  test("shows the market did not move message when the player has an unresolved active guess after resolvesAfter", async ({
    page,
  }) => {
    const expiredGuess = createMockGuess({
      id: "active-expired-e2e",
      resolvesAfter: new Date(Date.now() - 1000).toISOString(),
    });

    await mockApiRoutes(page, {
      player: playerWithActiveGuess(expiredGuess),
      guesses: {
        [expiredGuess.id]: expiredGuess,
      },
    });

    await page.goto("/");

    await expect(page.getByText("Active guess")).toBeVisible();
    await expect(page.getByText("Market did not move")).toBeVisible();
    await expect(
      page.getByText("Give it a couple of extra seconds...")
    ).toBeVisible();
  });

  test("shows the result when the player has a resolved active guess", async ({
    page,
  }) => {
    const resolvedGuess = createMockGuess({
      id: "resolved-won-e2e",
      resolvedAt: new Date().toISOString(),
      resolvedPrice: 70150,
      result: "won",
    });

    await mockApiRoutes(page, {
      player: {
        ...playerWithActiveGuess(resolvedGuess),
        score: 3,
      },
      guesses: {
        [resolvedGuess.id]: resolvedGuess,
      },
    });

    await page.goto("/");

    await expect(page.getByText("CORRECT CALL")).toBeVisible();
    await expect(page.getByText("+1 point")).toBeVisible();
  });

  test("creates a new guess after the player sees a resolved result", async ({
    page,
  }) => {
    const resolvedGuess = createMockGuess({
      id: "resolved-before-new-guess-e2e",
      resolvedAt: new Date().toISOString(),
      resolvedPrice: 70100,
      result: "lost",
    });
    const createdGuess = createMockGuess({
      id: "new-guess-after-result-e2e",
      direction: "down",
    });
    const createGuessRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/api/guesses"
    );

    await mockApiRoutes(page, {
      player: playerWithActiveGuess(resolvedGuess),
      createdGuess,
      guesses: {
        [resolvedGuess.id]: resolvedGuess,
      },
    });

    await page.goto("/");
    await expect(page.getByText("WRONG CALL")).toBeVisible();
    await page.getByRole("button", { name: /DOOM/ }).click();

    const request = await createGuessRequest;

    expect(request.postDataJSON()).toEqual({ direction: "down" });
    await expect(page.getByText("Active guess")).toBeVisible();
    await expect(page.getByText("📉 Doom")).toBeVisible();
    await expect(page.getByText("Seconds left")).toBeVisible();
  });

  test("creates a guess and shows the countdown when there is no active guess", async ({
    page,
  }) => {
    const createdGuess = createMockGuess({
      id: "created-guess-e2e",
      direction: "up",
    });
    const createGuessRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/api/guesses"
    );

    await mockApiRoutes(page, { createdGuess });

    await page.goto("/");
    await expectDefaultState(page);
    await page.getByRole("button", { name: /MOON/ }).click();

    const request = await createGuessRequest;

    expect(request.postDataJSON()).toEqual({ direction: "up" });
    await expect(page.getByText("Active guess")).toBeVisible();
    await expect(page.getByText("📈 Moon")).toBeVisible();
    await expect(page.getByText("Seconds left")).toBeVisible();
  });
});
