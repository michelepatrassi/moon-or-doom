import { createDynamoDbDocument } from "./dynamodb";
import { getPendingGuess } from "./guesses";

jest.mock("./dynamodb", () => ({
  createDynamoDbDocument: jest.fn(),
}));

const mockedCreateDynamoDbDocument =
  createDynamoDbDocument as jest.MockedFunction<typeof createDynamoDbDocument>;

describe("getPendingGuess", () => {
  const query = jest.fn();

  beforeEach(() => {
    query.mockReset();
    mockedCreateDynamoDbDocument.mockReturnValue({
      query,
    } as unknown as ReturnType<typeof createDynamoDbDocument>);
  });

  it("queries pending guesses with the required DynamoDB expression aliases", async () => {
    query.mockResolvedValue({
      Items: [],
    });

    await expect(getPendingGuess("player-1")).resolves.toBeNull();

    expect(query).toHaveBeenCalledWith({
      TableName: "guesses",
      KeyConditionExpression: "playerId = :playerId",
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":playerId": "player-1",
        ":status": "pending",
      },
      Limit: 1,
    });
  });
});
