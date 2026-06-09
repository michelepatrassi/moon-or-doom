import axios from "axios";
import { getKrakenCurrentPrice } from "./kraken";

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getKrakenCurrentPrice", () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it("returns the current price", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        result: {
          BTCUSD: {
            c: ["100000.5", "0.01"],
          },
        },
      },
    });

    await expect(getKrakenCurrentPrice("BTC/USD")).resolves.toBe(100000.5);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.kraken.com/0/public/Ticker",
      {
        params: {
          pair: "BTC/USD",
        },
      }
    );
  });

  it("rejects invalid Kraken payloads", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        result: {},
      },
    });

    await expect(getKrakenCurrentPrice("BTC/USD")).rejects.toThrow(
      "Kraken returned an invalid price"
    );
  });
});
