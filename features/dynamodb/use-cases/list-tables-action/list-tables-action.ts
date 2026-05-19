"use server";

import { listTables } from "@/features/dynamodb/services/list-tables/list-tables";
import type { DynamoDBTable } from "@/features/dynamodb/types/dynamodb";

export async function listTablesAction(): Promise<DynamoDBTable[]> {
  return listTables();
}
