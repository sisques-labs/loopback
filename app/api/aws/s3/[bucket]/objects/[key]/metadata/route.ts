import type { NextRequest } from "next/server";
import { headObject } from "@/features/s3/services/head-object/head-object";
import { toFriendlyError } from "@/lib/aws/errors";

type RouteParams = { params: Promise<{ bucket: string; key: string }> };

export async function GET(_req: NextRequest, ctx: RouteParams) {
  const { bucket, key } = await ctx.params;

  try {
    const object = await headObject(bucket, key);

    if (!object) {
      return Response.json(
        { ok: false, error: "Object not found.", code: "NoSuchKey" },
        { status: 404 },
      );
    }

    return Response.json({ ok: true, data: object }, { status: 200 });
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    return Response.json({ ok: false, error: message, code }, { status: 500 });
  }
}
