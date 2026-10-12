// The shape every export writer takes: a titled table of typed cells. A list builds one of these
// once and each format writes it its own way.

export type ExportValue = string | number | Date | null;

/** Colours a cell in formats that have colour (the PDF): the app's status tones. */
export type ExportTone = "positive" | "warning" | "negative";

export type ExportCell = { value: ExportValue; tone?: ExportTone };

export type ExportColumn = {
  header: string;
  /** In characters, as spreadsheets measure it. */
  width: number;
  align?: "right";
};

export type ExportTable = {
  title: string;
  /** "3 meetings, exported 8 Oct 2026, 15:42" */
  subtitle: string;
  columns: ExportColumn[];
  rows: ExportCell[][];
};
