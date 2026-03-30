import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { db } from "@/lib/prisma";
import { evaluateFlag } from "@/server/services/flag-evaluation";

function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function GET(req: NextRequest) {
  // 1. Authenticate via API key
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing x-api-key header" }, { status: 401 });
  }

  const keyHash = hashApiKey(apiKey);
  const keyRecord = await db.apiKey.findUnique({
    where: { keyHash },
    select: { projectId: true },
  });

  if (!keyRecord) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // 2. Parse query params
  const flag = req.nextUrl.searchParams.get("flag");
  const userId = req.nextUrl.searchParams.get("userId") ?? undefined;
  const attributesRaw = req.nextUrl.searchParams.get("attributes");

  if (!flag) {
    return NextResponse.json({ error: "Missing 'flag' query parameter" }, { status: 400 });
  }

  let attributes: Record<string, string> | undefined;
  if (attributesRaw) {
    try {
      attributes = JSON.parse(attributesRaw);
    } catch {
      return NextResponse.json({ error: "Invalid 'attributes' JSON" }, { status: 400 });
    }
  }

  // 3. Evaluate flag
  const enabled = await evaluateFlag(keyRecord.projectId, flag, userId, attributes);

  return NextResponse.json({ enabled });
}
