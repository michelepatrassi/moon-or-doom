import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("formats a price using the provided locale and currency", () => {
    expect(
      formatPrice({
        price: 67842.25,
        locale: "en-US",
        currency: "USD",
      }),
    ).toBe("$67,842.25");
  });

  it("uses locale-specific separators and currency placement", () => {
    expect(
      formatPrice({
        price: 67842.25,
        locale: "it-IT",
        currency: "USD",
      }),
    ).toBe("67.842,25\u00a0USD");
  });
});
