import { format } from "date-fns";
import type { ExportTable, ExportTone, ExportValue } from "./table";

// The light theme's tokens: a file has no CSS, and a printed report is always light.
const INK = "#15171f";
const MUTED = "#7a8194";
const PRIMARY = "#5b5bd6";
const ZEBRA = "#f5f6fa";
const BORDER = "#e6e8ef";
const toneColor: Record<ExportTone, string> = {
  positive: "#1e9e6a",
  warning: "#d97a0f",
  negative: "#c2333f",
};

const MARGIN = 40;

function pdfText(value: ExportValue): string {
  if (value === null) return "";
  return value instanceof Date ? format(value, "d MMM yyyy, HH:mm") : String(value);
}

/**
 * A landscape A4 report: the title with the app name on the right, the subtitle, the table with
 * an indigo header that repeats on every page, light zebra rows, coloured statuses, and
 * "Page 1 of 2" at the foot of each page.
 */
export async function writePdf(table: ExportTable): Promise<Blob> {
  // Loaded on the first export only, so the app's first load stays as small as it was.
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold").setFontSize(18).setTextColor(INK);
  doc.text(table.title, MARGIN, 52);
  doc.setTextColor(PRIMARY).setFontSize(12);
  doc.text("Recap", width - MARGIN, 52, { align: "right" });
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(MUTED);
  doc.text(table.subtitle, MARGIN, 70);

  autoTable(doc, {
    startY: 88,
    margin: { left: MARGIN, right: MARGIN, bottom: 48 },
    head: [table.columns.map((column) => column.header)],
    body: table.rows.map((row) => row.map((cell) => pdfText(cell.value))),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 6, textColor: INK, lineColor: BORDER },
    headStyles: { fillColor: PRIMARY, textColor: "#ffffff", fontStyle: "bold" },
    alternateRowStyles: { fillColor: ZEBRA },
    columnStyles: Object.fromEntries(
      table.columns.map((column, index) => [index, { halign: column.align ?? "left" }]),
    ),
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const tone = table.rows[data.row.index]?.[data.column.index]?.tone;
      if (!tone) return;
      data.cell.styles.textColor = toneColor[tone];
      data.cell.styles.fontStyle = "bold";
    },
  });

  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(MUTED);
    doc.text(`Page ${page} of ${pages}`, width - MARGIN, height - 24, { align: "right" });
  }
  return doc.output("blob");
}
