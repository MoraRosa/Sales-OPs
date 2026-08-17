/**
 * A prospect is a business Peak Empire might sell to. This is the
 * normalized replacement for the old flattened "Leads" tab -- identity
 * and status fields only. Research, scoring, and deal data live in
 * their own entities and join on `id`.
 */
export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "unqualified"
  | "customer"
  | "lost";

export type LeadSource =
  | "google_places"
  | "yelp"
  | "apollo"
  | "manual"
  | "referral";

export interface Prospect {
  id: string; // e.g. "PROS-0001", the join key across every entity
  businessName: string;
  industry: string;
  subIndustry?: string;
  serviceType?: string;
  website?: string;
  phone?: string;
  email?: string;
  city?: string;
  region?: string;
  country?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  primaryContactName?: string;
  primaryContactRole?: string;
  isDecisionMaker?: boolean;
  source: LeadSource;
  sourceDetail?: string; // e.g. the search query that found it
  status: LeadStatus;
  dateAdded: string; // ISO date
  lastContact?: string;
  lastContactChannel?: "call" | "email";
  nextFollowUp?: string;
  contactAttempts: number;
  notes?: string;
}
