export interface DynamoDBTable {
  name: string;
  status: string;
  itemCount: number;
  tableSizeBytes: number;
  partitionKeyName: string;
  partitionKeyType: string;
  sortKeyName?: string;
  sortKeyType?: string;
}

export interface ScanResult {
  items: Record<string, unknown>[];
  nextKey: string | null; // base64-encoded ExclusiveStartKey
}

export interface DynamoDBKey {
  partitionKeyName: string;
  partitionKeyValue: string;
  sortKeyName?: string;
  sortKeyValue?: string;
}

export type KeyType = "S" | "N" | "B";

export interface CreateTableInput {
  tableName: string;
  partitionKeyName: string;
  partitionKeyType: KeyType;
  sortKeyName?: string;
  sortKeyType?: KeyType;
}
