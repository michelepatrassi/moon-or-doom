/**
 * @jest-environment node
 */

import { createDynamoDbDocument } from "../dynamodb";
import { getGuess, updateGuess } from "./guess.repository";
import { type Guess, type GuessKey } from "./guess.types";

jest.mock("../dynamodb", () => ({
  createDynamoDbDocument: jest.fn(),
}));

const mockedCreateDynamoDbDocument =
  createDynamoDbDocument as jest.MockedFunction<typeof createDynamoDbDocument>;

const documentClient = {
  get: jest.fn(),
  update: jest.fn(),
};

const guessKey: GuessKey = {
  id: "guess-1",
  playerId: "player-1",
};

const guess: Guess = {
  ...guessKey,
  createdAt: "2026-06-08T12:00:00.000Z",
  direction: "up",
  entryPrice: 100000,
  resolvesAt: "2026-06-08T12:01:00.000Z",
  status: "pending",
};

describe("guess repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedCreateDynamoDbDocument.mockReturnValue(
      documentClient as unknown as ReturnType<typeof createDynamoDbDocument>
    );
  });

  it("gets a guess with the full DynamoDB composite key", async () => {
    documentClient.get.mockResolvedValue({ Item: guess });

    await expect(getGuess(guessKey)).resolves.toEqual(guess);

    expect(documentClient.get).toHaveBeenCalledWith({
      TableName: "guesses",
      Key: guessKey,
    });
  });

  it("updates a guess with the full DynamoDB composite key", async () => {
    documentClient.update.mockResolvedValue({});

    await updateGuess(guessKey, { status: "resolved" });

    expect(documentClient.update).toHaveBeenCalledWith({
      TableName: "guesses",
      Key: guessKey,
      UpdateExpression: "SET #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "resolved",
      },
    });
  });
});
