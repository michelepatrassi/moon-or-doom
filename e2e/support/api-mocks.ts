import { Guess } from "@/app/lib/guesses/guess.types";
import { Player } from "@/app/lib/players/player.types";
import { type Page, type Route } from "@playwright/test";

type ApiMockOptions = {
  player?: Player | null;
  createdPlayer?: Player;
  createdGuess?: Guess;
  guesses?: Record<string, Guess>;
};

const now = "2026-06-12T10:00:00.000Z";

export const initialPlayer: Player = {
  id: "player-e2e",
  score: 0,
  createdAt: now,
  updatedAt: now,
};

const initialGuess: Guess = {
  id: "guess-e2e",
  playerId: initialPlayer.id,
  direction: "up",
  entryPrice: 70123.45,
  createdAt: now,
  updatedAt: now,
  resolvesAfter: "2026-06-12T10:01:00.000Z",
};

const json = (route: Route, status: number, body: unknown) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

export const mockApiRoutes = async (
  page: Page,
  {
    player = initialPlayer,
    createdPlayer = initialPlayer,
    createdGuess = initialGuess,
    guesses = {},
  }: ApiMockOptions = {}
) => {
  const guessesById: Record<string, Guess> = {
    [createdGuess.id]: createdGuess,
    ...guesses,
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const method = request.method();
    const { pathname } = new URL(request.url());

    if (pathname === "/api/me" && method === "GET") {
      if (player === null) {
        await json(route, 401, { error: "Missing player id" });
        return;
      }

      await json(route, 200, player);
      return;
    }

    if (pathname === "/api/me" && method === "POST") {
      await json(route, 201, createdPlayer);
      return;
    }

    if (pathname === "/api/guesses" && method === "POST") {
      const body = request.postDataJSON() as { direction?: "up" | "down" };

      await json(route, 201, {
        ...createdGuess,
        direction: body.direction ?? createdGuess.direction,
      });
      return;
    }

    const guessMatch = pathname.match(/^\/api\/guesses\/([^/]+)$/);

    if (guessMatch && method === "GET") {
      const guess = guessesById[decodeURIComponent(guessMatch[1])];

      await json(
        route,
        guess ? 200 : 404,
        guess ?? { error: "Mocked guess not found" }
      );
      return;
    }

    await json(route, 500, {
      error: `Unhandled mocked API route: ${method} ${pathname}`,
    });
  });
};
