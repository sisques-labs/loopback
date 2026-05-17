export function parseCSV(text: string): Record<string, string>[] {
  const rows = text
    .split(/\r?\n/)
    .map((r) => r.split(",").map((cell) => cell.trim()));

  const nonEmpty = rows.filter((r) => r.some((cell) => cell.length > 0));
  if (nonEmpty.length < 2) return [];

  const headers = nonEmpty[0];
  return nonEmpty.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? "";
    });
    return obj;
  });
}
