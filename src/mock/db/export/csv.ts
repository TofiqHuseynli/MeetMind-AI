import { format } from "date-fns";
import type { ExportTable, ExportValue } from "./table";

// Excel reads a UTF-8 CSV correctly only when it starts with a byte order mark.
const BOM = "﻿";

function csvCell(value: ExportValue): string {
  if (value === null) return "";
  const text = value instanceof Date ? format(value, "yyyy-MM-dd HH:mm") : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function writeCsv(table: ExportTable): Blob {
  const lines = [
    table.columns.map((column) => csvCell(column.header)),
    ...table.rows.map((row) => row.map((cell) => csvCell(cell.value))),
  ];
  const text = lines.map((line) => line.join(",")).join("\n");
  return new Blob([BOM + text], { type: "text/csv;charset=utf-8" });
}
