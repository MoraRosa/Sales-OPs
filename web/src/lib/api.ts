/**
 * Thin fetch wrapper over the Firebase Functions HTTP endpoints. This
 * is the ONLY file the app's UI code needs to touch if the backend
 * URL, auth scheme, or hosting provider ever changes.
 */
const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL as string;

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${FUNCTIONS_BASE_URL}/${path}`);
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return res.json();
}

export const api = {
  discoverProspects: (body: { industry: string; city: string; region?: string; sources?: string[] }) =>
    post<{ found: number; added: number; skippedDuplicates: number }>("discoverProspects", body),

  addManualProspect: (body: {
    businessName: string;
    industry: string;
    city?: string;
    phone?: string;
    email?: string;
    instagram?: string;
    facebook?: string;
    notes?: string;
  }) => post<{ ok: true }>("addManualProspect", body),

  logCall: (body: {
    prospectId: string;
    outcome: string;
    summary?: string;
    followUpDate?: string;
    nextAction?: string;
  }) => post<{ ok: true; activityId: string }>("logCall", body),

  callQueue: () => get<{ queue: Record<string, unknown>[] }>("callQueue"),

  qualifyProspect: (prospectId: string) =>
    post<{ ok: true; qualification: Record<string, unknown> }>("qualifyProspect", { prospectId }),

  getProspectDetail: (prospectId: string) =>
    get<{
      prospect: Record<string, string>;
      research?: Record<string, string>;
      qualification?: Record<string, string>;
      activities: Record<string, string>[];
      timeline: Record<string, string>[];
    }>(`prospectDetail?prospectId=${encodeURIComponent(prospectId)}`),

  createOpportunity: (body: {
    prospectId: string;
    name: string;
    plan?: string;
    dealValue?: number;
    mrr?: number;
    setupFee?: number;
    expectedClose?: string;
  }) => post<{ ok: true; id: string }>("createOpportunity", body),

  getOpportunities: () =>
    get<{
      opportunities: Record<string, string>[];
      totals: { dealValueInFlight: number; mrrInFlight: number; countInFlight: number };
    }>("opportunities"),

  updateOpportunityStage: (body: { opportunityId: string; stage: string; lostReason?: string }) =>
    post<{ ok: true }>("updateOpportunityStage", body),

  getCustomers: () => get<{ customers: Record<string, string>[] }>("customers"),

  enrichProspect: (prospectId: string) =>
    post<{ ok: true; found: boolean; patch?: Record<string, string> }>("enrichProspect", {
      prospectId,
    }),

  getEmailTemplates: () => get<{ templates: Record<string, string>[] }>("emailTemplates"),

  sendColdEmail: (body: { prospectId: string; subject: string; body: string }) =>
    post<{ ok: true; messageId?: string }>("sendColdEmail", body),
};
