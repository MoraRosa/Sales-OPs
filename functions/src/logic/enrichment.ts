export interface ApolloEnrichmentResult {
  primaryContactName?: string;
  primaryContactRole?: string;
  email?: string;
  linkedin?: string;
}

/**
 * Turns an Apollo response into a Sheet-row patch, dropping fields
 * Apollo didn't return rather than overwriting existing data with
 * blanks. Pure so it's testable without a live Apollo call.
 */
export function buildEnrichmentPatch(result: ApolloEnrichmentResult): Record<string, string> {
  const patch: Record<string, string> = {};
  if (result.primaryContactName) patch.primaryContactName = result.primaryContactName;
  if (result.primaryContactRole) patch.primaryContactRole = result.primaryContactRole;
  if (result.email) patch.email = result.email;
  if (result.linkedin) patch.linkedin = result.linkedin;
  return patch;
}
