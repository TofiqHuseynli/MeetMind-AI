import type { ExportTable, ExportValue } from "./table";

// The header in the app's indigo tint (`primary` at 10%), as a file has no CSS.
const HEADER_FILL = "#EEEEFC";

function xlsxCell(value: ExportValue) {
  if (value instanceof Date) return { value, type: Date, format: "yyyy-mm-dd hh:mm" };
  if (typeof value === "number") return { value, type: Number };
  return { value: value ?? "" };
}

/** A real .xlsx: bold header that stays on screen, date and number cells, column widths. */
export async function writeXlsx(table: ExportTable): Promise<Blob> {
  // Loaded on the first export only, so the app's first load stays as small as it was.
  const { default: writeExcelFile } = await import("write-excel-file/browser");
  const header = table.columns.map((column) => ({
    value: column.header,
    fontWeight: "bold" as const,
    backgroundColor: HEADER_FILL,
  }));
  const rows = table.rows.map((row) => row.map((cell) => xlsxCell(cell.value)));
  return writeExcelFile([header, ...rows], {
    columns: table.columns.map((column) => ({ width: column.width })),
    stickyRowsCount: 1,
  }).toBlob();
}
