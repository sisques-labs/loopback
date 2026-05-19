"use server";

import { listFunctions } from "@/features/lambda/services/list-functions/list-functions";
import type { LambdaFunction } from "@/features/lambda/types/lambda";

export async function listFunctionsAction(): Promise<LambdaFunction[]> {
  return listFunctions();
}
