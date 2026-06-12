import { expect, type Page, test } from "@playwright/test";

import { mockApiRoutes } from "./support/api-mocks";
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
});
