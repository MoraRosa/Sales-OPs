/** Enrichment data gathered about a prospect after discovery. */
export interface Research {
  prospectId: string;
  hasWebsite?: boolean;
  websiteQuality?: "poor" | "fair" | "good" | "excellent";
  googleRating?: number;
  reviewCount?: number;
  yearsInBusiness?: number;
  socialFollowers?: number;
  techStack?: string[]; // e.g. detected booking/payment/CRM tools
  decisionMaker?: string;
  painPoints?: string[];
  researchNotes?: string;
  researchedAt?: string;
}
