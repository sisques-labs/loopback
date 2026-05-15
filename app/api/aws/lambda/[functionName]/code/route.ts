import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { decodeFunctionNameParam, encodeFunctionNameForRoute } from "@/features/lambda/lib/route-codec";
import { MAX_ZIP_BYTES } from "@/features/lambda/lib/runtimes";
import { toFriendlyError } from "@/features/lambda/lib/errors";
import { updateFunctionCode } from "@/features/lambda/use-cases/update-function-code/update-function-code";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE } from "@/features/shared/i18n/locale";

type CodeRouteParams = { params: Promise<{ functionName: string }> };

export async function POST(req: NextRequest, ctx: CodeRouteParams) {
  const { functionName: functionNameParam } = await ctx.params;
  const functionName = decodeFunctionNameParam(functionNameParam);
  const dict = getDictionary(DEFAULT_LOCALE).lambda;

  const contentLength = req.headers.get("content-length");
  if (contentLength != null && contentLength !== "") {
    const bytes = Number(contentLength);
    if (!Number.isNaN(bytes) && bytes > MAX_ZIP_BYTES) {
      return Response.json(
        {
          ok: false,
          error: dict.sdkErrors.payloadTooLarge,
          code: "RequestEntityTooLargeException",
        },
        { status: 413 },
      );
    }
  }

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

  if (file.size > MAX_ZIP_BYTES) {
    return Response.json(
      {
        ok: false,
        error: dict.sdkErrors.payloadTooLarge,
        code: "RequestEntityTooLargeException",
      },
      { status: 413 },
    );
  }

  try {
    await updateFunctionCode({ functionName, file });
    revalidatePath(`/lambda/${encodeFunctionNameForRoute(functionName)}`);
    revalidatePath("/lambda", "layout");
    return Response.json({ ok: true, functionName });
  } catch (err) {
    const { code, message } = toFriendlyError(err, dict.sdkErrors);
    return Response.json({ ok: false, error: message, code }, { status: 500 });
  }
}
