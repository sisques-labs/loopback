"use server";
import "server-only";

import { CreateFunctionCommand, PackageType } from "@aws-sdk/client-lambda";
import { revalidatePath } from "next/cache";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { toFriendlyError } from "@/features/lambda/lib/errors";
import { validateFunctionNameInput } from "@/features/lambda/lib/validate-function-name";
import { SUPPORTED_RUNTIMES, type SupportedRuntime } from "@/features/lambda/lib/runtimes";
import { STUB_ZIP_BUFFER } from "@/features/lambda/lib/stub-zip";
import type { ActionState } from "@/features/shared/types/action-state";

export async function createFunctionAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = (formData.get("name") as string | null) ?? "";
  const runtime = (formData.get("runtime") as string | null) ?? "";
  const handler = (formData.get("handler") as string | null) ?? "";
  const role = (formData.get("role") as string | null) ?? "";
  const description = (formData.get("description") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = getDictionary(locale).lambda;

  // Validate function name
  const nameCode = validateFunctionNameInput(name);
  if (nameCode) {
    return { status: "error", message: dict.createFunctionValidation[nameCode] };
  }

  // Validate runtime is in the curated list (defensive)
  if (!runtime || !(SUPPORTED_RUNTIMES as readonly string[]).includes(runtime)) {
    return { status: "error", message: dict.createFunctionValidation.invalidRuntime };
  }

  // Validate handler
  const trimmedHandler = handler.trim();
  if (!trimmedHandler) {
    return { status: "error", message: dict.createFunctionValidation.handlerRequired };
  }

  // Validate role
  const trimmedRole = role.trim();
  if (!trimmedRole) {
    return { status: "error", message: dict.createFunctionValidation.roleRequired };
  }

  try {
    const client = await getLambdaClient();
    await client.send(
      new CreateFunctionCommand({
        FunctionName: name.trim(),
        Runtime: runtime as SupportedRuntime,
        Role: trimmedRole,
        Handler: trimmedHandler,
        Description: description.trim() || undefined,
        Code: { ZipFile: STUB_ZIP_BUFFER },
        PackageType: PackageType.Zip,
      }),
    );
    revalidatePath("/lambda", "layout");
    return { status: "success", data: undefined };
  } catch (err) {
    const { message } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message };
  }
}
