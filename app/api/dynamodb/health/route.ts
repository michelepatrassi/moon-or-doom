import { ListTablesCommand } from "@aws-sdk/client-dynamodb";

import { createDynamoDbClient } from "@/app/lib/dynamodb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await createDynamoDbClient().send(new ListTablesCommand({}));

    return Response.json({
      ok: true,
    });
  } catch {
    return Response.json(
      {
        ok: false,
      },
      { status: 503 },
    );
  }
}
