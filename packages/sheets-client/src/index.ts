import { google, sheets_v4 } from "googleapis";
import { TABS, HEADERS, type TabName } from "./schema.js";

export { TABS, HEADERS };
export type { TabName };

/**
 * The only file in the app that talks to the Google Sheets API directly.
 * Everything else (Functions routes, adapters) calls this class. To swap
 * Sheets for a real database later, this is the one file that changes --
 * every consumer keeps calling getRows/appendRow/updateRow unchanged.
 */
export class SheetsClient {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor(spreadsheetId: string, auth: NonNullable<sheets_v4.Options["auth"]>) {
    this.spreadsheetId = spreadsheetId;
    this.sheets = google.sheets({ version: "v4", auth });
  }

  /** Read every row in a tab as plain objects keyed by the schema headers. */
  async getRows(tab: TabName): Promise<Record<string, string>[]> {
    const headers = HEADERS[tab];
    const range = `${tab}!A2:${columnLetter(headers.length)}`;
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });
    const rows = res.data.values ?? [];
    return rows.map((row) =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] ?? ""]))
    );
  }

  /** Append one row. Object keys are matched against the tab's schema headers. */
  async appendRow(tab: TabName, record: Record<string, unknown>): Promise<void> {
    const headers = HEADERS[tab];
    const row = headers.map((h) => stringify(record[h]));
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${tab}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  }

  /**
   * Update a row found by matching `idColumn` against `idValue`. Reads the
   * tab first to find the row index -- fine at this scale (hundreds, not
   * millions, of rows); revisit if a tab ever grows past a few thousand rows.
   */
  async updateRow(
    tab: TabName,
    idColumn: string,
    idValue: string,
    patch: Record<string, unknown>
  ): Promise<boolean> {
    const headers = HEADERS[tab];
    const idIndex = headers.indexOf(idColumn);
    if (idIndex === -1) throw new Error(`${idColumn} is not a column in ${tab}`);

    const range = `${tab}!A2:${columnLetter(headers.length)}`;
    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });
    const rows = res.data.values ?? [];
    const rowIdx = rows.findIndex((r) => r[idIndex] === idValue);
    if (rowIdx === -1) return false;

    const current = Object.fromEntries(headers.map((h, i) => [h, rows[rowIdx][i] ?? ""]));
    const merged = { ...current, ...patch };
    const newRow = headers.map((h) => stringify(merged[h]));

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${tab}!A${rowIdx + 2}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [newRow] },
    });
    return true;
  }
}

function stringify(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join("; ");
  return String(value);
}

function columnLetter(count: number): string {
  let n = count;
  let letters = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    letters = String.fromCharCode(65 + rem) + letters;
    n = Math.floor((n - 1) / 26);
  }
  return letters;
}
