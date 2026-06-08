import { getRandom } from "./get-random";

describe("getRandom", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns an item from the provided array", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);

    expect(getRandom(["first", "second", "third"])).toBe("second");
  });

  it("can return the last item", () => {
    jest.spyOn(Math, "random").mockReturnValue(0.99);

    expect(getRandom(["first", "second", "third"])).toBe("third");
  });

  it("throws when the array is empty", () => {
    expect(() => getRandom([])).toThrow(
      "Cannot get a random item from an empty array"
    );
  });
});
