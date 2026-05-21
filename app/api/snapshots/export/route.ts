import { type NextRequest } from "next/server";
import { snapshotDocumentSchema } from "@/features/snapshots/lib/schema/snapshot-schema";

export async function POST(req: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const { snapshot } = (body as Record<string, unknown>) ?? {};

  const parseResult = snapshotDocumentSchema.safeParse(snapshot);
  if (!parseResult.success) {
    return new Response("Invalid snapshot", { status: 400 });
  }

  const doc = parseResult.data;
  const date = new Date().toISOString().slice(0, 10);
  const filename = `loopback-snapshot-${date}.json`;

  return new Response(JSON.stringify(doc, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
