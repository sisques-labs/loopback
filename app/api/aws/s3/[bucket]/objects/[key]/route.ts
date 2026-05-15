import type { NextRequest } from "next/server";
import { GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";

type ObjectKeyRouteParams = { params: Promise<{ bucket: string; key: string }> };

export async function GET(req: NextRequest, ctx: ObjectKeyRouteParams) {
  const { bucket, key } = await ctx.params;
  const download = req.nextUrl.searchParams.get("download") === "1";

  try {
    const client = getS3Client();
    const { Body, ContentType, ContentLength } = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );

    if (!Body) {
      return Response.json({ ok: false, error: "Empty response from S3." }, { status: 502 });
    }

    const headers = new Headers();
    if (ContentType) headers.set("Content-Type", ContentType);
    if (ContentLength) headers.set("Content-Length", String(ContentLength));
    if (download) {
      const filename = key.split("/").pop() ?? key;
      headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    }

    return new Response(Body as ReadableStream, { headers });
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    const status = code === "NoSuchKey" ? 404 : 500;
    return Response.json({ ok: false, error: message, code }, { status });
  }
}

export async function DELETE(_req: NextRequest, ctx: ObjectKeyRouteParams) {
  const { bucket, key } = await ctx.params;

  try {
    const client = getS3Client();
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    revalidatePath(`/s3/${bucket}`);
    return Response.json({ ok: true });
  } catch (err) {
    const friendly = toFriendlyError(err);
    if (friendly.code === "NoSuchKey") {
      revalidatePath(`/s3/${bucket}`);
      return Response.json({ ok: true });
    }
    return Response.json({ ok: false, error: friendly.message, code: friendly.code }, { status: 500 });
  }
}
