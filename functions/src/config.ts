/**
 * All secrets come from environment variables, validated at startup --
 * fail fast rather than failing weirdly three requests later.
 *
 * Locally: set these in .env (see .env.example), read automatically.
 *
 * In production, `process.env` is NOT automatically populated from
 * Secret Manager -- Firebase Functions v2 requires each function to
 * explicitly list which secrets it needs via the `secrets: [...]`
 * option on `onRequest`. These constants are that list, imported by
 * every route file, so the mapping between "what a route reads" and
 * "what's actually bound to it at deploy time" can't drift apart.
 * Set the real values with:
 *   firebase functions:secrets:set SHEET_ID
 *   firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON
 *   ...etc, once per secret, before the first deploy.
 */
export const SHEETS_SECRETS = ["SHEET_ID", "GOOGLE_SERVICE_ACCOUNT_JSON"] as const;
export const PLACES_SECRETS = ["GOOGLE_PLACES_API_KEY"] as const;
export const YELP_SECRETS = ["YELP_API_KEY"] as const;
export const APOLLO_SECRETS = ["APOLLO_API_KEY"] as const;
export const EMAIL_SECRETS = ["RESEND_API_KEY", "FROM_EMAIL"] as const;

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  sheetId: () => required("SHEET_ID"),
  googleServiceAccountJson: () => required("GOOGLE_SERVICE_ACCOUNT_JSON"),
  googlePlacesApiKey: () => required("GOOGLE_PLACES_API_KEY"),
  yelpApiKey: () => process.env.YELP_API_KEY ?? "",
  apolloApiKey: () => process.env.APOLLO_API_KEY ?? "",
  resendApiKey: () => process.env.RESEND_API_KEY ?? "",
  fromEmail: () => process.env.FROM_EMAIL ?? "",
};
