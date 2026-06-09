jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    isAxiosError: jest.fn((error: { isAxiosError?: unknown } | null) =>
      Boolean(error?.isAxiosError)
    ),
    post: jest.fn(),
  },
}));
