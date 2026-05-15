"use server";

import "server-only";
import { InvokeCommand } from "@aws-sdk/client-lambda";
import { getLambdaClient } from "@/features/lambda/lib/client";
import { toFriendlyError } from "@/features/lambda/lib/errors";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import enLambda from "@/features/lambda/i18n/en";
import esLambda from "@/features/lambda/i18n/es";
import type { ActionState } from "@/features/shared/types/action-state";
import type { InvokeResult } from "@/features/lambda/types/lambda";

const lambdaDicts = { en: enLambda, es: esLambda } as const;

export async function invokeFunctionAction(
  _prev: ActionState<InvokeResult>,
  formData: FormData,
): Promise<ActionState<InvokeResult>> {
  const functionName = (formData.get("functionName") as string | null) ?? "";
  const payloadString = (formData.get("payload") as string | null) ?? "";
  const localeRaw = (formData.get("locale") as string | null) ?? "";
  const locale: Locale = isLocale(localeRaw) ? localeRaw : DEFAULT_LOCALE;
  const dict = lambdaDicts[locale];

  // Empty payload → undefined (do not pass to SDK)
  // Non-empty → JSON.parse first; if invalid → return error, do NOT call SDK
  let payload: Uint8Array | undefined = undefined;
  if (payloadString !== "") {
    try {
      JSON.parse(payloadString);
    } catch {
      return { status: "error", message: dict.invokeDialog.invalidPayload };
    }
    payload = new TextEncoder().encode(payloadString);
  }

  try {
    const client = getLambdaClient();
    const res = await client.send(
      new InvokeCommand({
        FunctionName: functionName,
        InvocationType: "RequestResponse",
        Payload: payload,
      }),
    );

    const body = new TextDecoder("utf-8").decode(res.Payload ?? new Uint8Array());

    // FunctionError is a domain result, not a transport error.
    // Return ActionState success with functionError populated so the caller
    // can render a distinct error banner rather than treating it as a toast.
    if (res.FunctionError) {
      return {
        status: "success",
        data: {
          statusCode: res.StatusCode ?? 0,
          body,
          functionError: res.FunctionError,
        },
      };
    }

    return {
      status: "success",
      data: {
        statusCode: res.StatusCode ?? 0,
        body,
      },
    };
  } catch (err) {
    const { message: errMsg } = toFriendlyError(err, dict.sdkErrors);
    return { status: "error", message: errMsg };
  }
}
