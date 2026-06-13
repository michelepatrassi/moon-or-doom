import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { type Ticker, useTicker } from "./use-ticker";

type MockWebSocketListener = (event: Event) => void;

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  readonly listeners = new Map<string, Set<MockWebSocketListener>>();
  readonly sentMessages: string[] = [];

  close = jest.fn();

  constructor(readonly url: string | URL) {
    MockWebSocket.instances.push(this);
  }

  addEventListener(type: string, listener: MockWebSocketListener) {
    const listeners = this.listeners.get(type) ?? new Set();

    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  emit(type: string, event: Event) {
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }

  send(message: string) {
    this.sentMessages.push(message);
  }
}

const selectLastPrice = (ticker: Ticker) => ticker.last;

const createTickerMessage = (ticker: Partial<Ticker> = {}) =>
  new MessageEvent("message", {
    data: JSON.stringify({
      channel: "ticker",
      data: [
        {
          ask: 101,
          bid: 99,
          change_pct: 0,
          last: 100,
          timestamp: "2026-06-05T12:00:00.000000Z",
          ...ticker,
        },
      ],
    }),
  });

const getRenderCount = () => renderLastPriceProbe.mock.calls.length;

const renderLastPriceProbe = jest.fn();

const LastPriceProbe = () => {
  renderLastPriceProbe();

  const { error, loading, retry, value } = useTicker({
    select: selectLastPrice,
  });

  return (
    <div>
      <p data-testid="last-price">{loading ? "loading" : (value ?? "none")}</p>
      <p data-testid="error-code">{error?.code ?? "none"}</p>
      <button onClick={retry} type="button">
        retry
      </button>
    </div>
  );
};

describe("useTicker", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let originalWebSocket: typeof WebSocket;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    originalWebSocket = global.WebSocket;
    MockWebSocket.instances = [];
    renderLastPriceProbe.mockClear();
    global.WebSocket = MockWebSocket as unknown as typeof WebSocket;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    global.WebSocket = originalWebSocket;
  });

  it("does not re-render the subscriber when the selected ticker value is unchanged", async () => {
    render(<LastPriceProbe />);

    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.emit("message", createTickerMessage({ last: 100 }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("last-price")).toHaveTextContent("100");
    });
    const renderCountAfterFirstPrice = getRenderCount();

    act(() => {
      socket.emit(
        "message",
        createTickerMessage({
          ask: 102,
          bid: 98,
          last: 100,
          timestamp: "2026-06-05T12:00:01.000000Z",
        })
      );
    });

    expect(getRenderCount()).toBe(renderCountAfterFirstPrice);

    act(() => {
      socket.emit("message", createTickerMessage({ last: 101 }));
    });

    expect(screen.getByTestId("last-price")).toHaveTextContent("101");
  });

  it("exposes ticker errors and reconnects on retry", async () => {
    render(<LastPriceProbe />);

    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.emit("message", createTickerMessage({ last: 100 }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("last-price")).toHaveTextContent("100");
    });

    act(() => {
      socket.emit("error", new Event("error"));
    });

    await waitFor(() => {
      expect(screen.getByTestId("error-code")).toHaveTextContent(
        "fetch_failed"
      );
    });
    expect(screen.getByTestId("last-price")).toHaveTextContent("none");
    expect(socket.close).toHaveBeenCalled();

    act(() => {
      screen.getByRole("button", { name: "retry" }).click();
    });

    await waitFor(() => {
      expect(MockWebSocket.instances).toHaveLength(2);
    });
    expect(screen.getByTestId("error-code")).toHaveTextContent("none");
    expect(screen.getByTestId("last-price")).toHaveTextContent("loading");
  });
});
