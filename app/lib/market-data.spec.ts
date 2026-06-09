import { TICKER } from "../constant";
import { getCurrentPrice } from "./market-data";
import { getKrakenCurrentPrice } from "./providers/kraken";

jest.mock("./providers/kraken", () => ({
  getKrakenCurrentPrice: jest.fn(),
}));

const mockedGetKrakenCurrentPrice =
  getKrakenCurrentPrice as jest.MockedFunction<typeof getKrakenCurrentPrice>;

describe("getCurrentPrice", () => {
  beforeEach(() => {
    mockedGetKrakenCurrentPrice.mockReset();
  });

  it("gets the current price from the configured provider", async () => {
    mockedGetKrakenCurrentPrice.mockResolvedValue(100000.5);

    await expect(getCurrentPrice(TICKER)).resolves.toBe(100000.5);
    expect(mockedGetKrakenCurrentPrice).toHaveBeenCalledWith(TICKER);
  });
});
