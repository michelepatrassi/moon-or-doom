import { Ticker } from "@/app/hooks/use-ticker";
import { type Page } from "@playwright/test";

export const initialTicker: Ticker = {
  bid: 70120,
  ask: 70125,
  last: 70123.45,
  change_pct: 1.25,
  timestamp: "2026-06-12T10:00:00.000Z",
};

export const mockTickerWebSocket = async (
  page: Page,
  ticker: Ticker = initialTicker
) => {
  await page.addInitScript((mockTicker) => {
    const krakenTickerUrl = "wss://ws.kraken.com/v2";
    const NativeWebSocket = window.WebSocket;

    class MockKrakenWebSocket extends EventTarget {
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSING = 2;
      static readonly CLOSED = 3;

      readonly url: string;
      readyState = MockKrakenWebSocket.CONNECTING;

      constructor(url: string | URL) {
        super();
        this.url = String(url);

        window.setTimeout(() => {
          this.readyState = MockKrakenWebSocket.OPEN;
          this.dispatchEvent(new Event("open"));

          window.setTimeout(() => {
            this.dispatchEvent(
              new MessageEvent("message", {
                data: JSON.stringify({
                  channel: "ticker",
                  type: "snapshot",
                  data: [mockTicker],
                }),
              })
            );
          }, 0);
        }, 0);
      }

      send() {}

      close() {
        if (this.readyState === MockKrakenWebSocket.CLOSED) {
          return;
        }

        this.readyState = MockKrakenWebSocket.CLOSED;
        this.dispatchEvent(new Event("close"));
      }
    }

    const createNativeWebSocket = (
      url: string | URL,
      protocols?: string | string[]
    ) =>
      protocols === undefined
        ? new NativeWebSocket(url)
        : new NativeWebSocket(url, protocols);

    const MockedWebSocket = function (
      url: string | URL,
      protocols?: string | string[]
    ) {
      if (String(url) === krakenTickerUrl) {
        return new MockKrakenWebSocket(url);
      }

      return createNativeWebSocket(url, protocols);
    };

    Object.defineProperties(MockedWebSocket, {
      CONNECTING: { value: NativeWebSocket.CONNECTING },
      OPEN: { value: NativeWebSocket.OPEN },
      CLOSING: { value: NativeWebSocket.CLOSING },
      CLOSED: { value: NativeWebSocket.CLOSED },
    });

    MockedWebSocket.prototype = NativeWebSocket.prototype;

    Object.defineProperty(window, "WebSocket", {
      configurable: true,
      writable: true,
      value: MockedWebSocket,
    });
  }, ticker);
};
