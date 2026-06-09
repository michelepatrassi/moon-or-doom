import { createDynamoDbClient } from "@/app/lib/dynamodb";

export async function GET() {
  try {
    await createDynamoDbClient().listTables();

    return Response.json({
      ok: true,
    });
  } catch (e) {
    console.error("DynamoDB health check failed:", e);

    return Response.json(
      {
        ok: false,
      },
      { status: 503 }
    );
  }
}
