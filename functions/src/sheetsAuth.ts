import { google } from "googleapis";
import { SheetsClient } from "@peak-empire/sheets-client";
import { config } from "./config.js";

let client: SheetsClient | null = null;

/** Lazily-constructed singleton -- one authenticated Sheets client per function instance. */
export function getSheetsClient(): SheetsClient {
  if (client) return client;

  const credentials = JSON.parse(config.googleServiceAccountJson());
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  client = new SheetsClient(config.sheetId(), auth);
  return client;
}
