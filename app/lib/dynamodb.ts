import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";

const endpoint = process.env.DYNAMODB_ENDPOINT;

export function createDynamoDbClient() {
  return new DynamoDB({
    endpoint,
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

export function createDynamoDbDocument() {
  return DynamoDBDocument.from(createDynamoDbClient(), {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
}
