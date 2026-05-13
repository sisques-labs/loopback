import type { NextRequest } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { revalidatePath } from "next/cache";
import { getS3Client } from "@/lib/aws/client-factory";
import { toFriendlyError } from "@/lib/aws/errors";

const MULTIPART_THRESHOLD = 5 * 1024 * 1024;

export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/aws/s3/[bucket]/objects">,
) {
  const { bucket } = await ctx.params;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ ok: false, error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: "No file provided." }, { status: 400 });
  }

  const key = file.name;
  const contentType = file.type || "application/octet-stream";

  try {
    const client = getS3Client();

    if (file.size < MULTIPART_THRESHOLD) {
      const buffer = Buffer.from(await file.arrayBuffer());
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ContentLength: file.size,
        }),
      );
    } else {
      const upload = new Upload({
        client,
        params: {
          Bucket: bucket,
          Key: key,
          Body: file.stream(),
          ContentType: contentType,
        },
      });
      await upload.done();
    }

    revalidatePath(`/s3/${bucket}`);
    return Response.json({ ok: true, key });
  } catch (err) {
    const { code, message } = toFriendlyError(err);
    return Response.json({ ok: false, error: message, code }, { status: 500 });
  }
}
