/**
 * Single source of truth for the Google Sheet's shape. Both
 * `scripts/init-sheet.ts` (creates tabs + headers in a blank sheet) and
 * `SheetsClient` (reads/writes rows) import from here. Change the
 * schema in exactly one place.
 */
export const TABS = {
  PROSPECTS: "Prospects",
  RESEARCH: "Research",
  QUALIFICATION: "Qualification",
  ACTIVITIES: "Activities",
  TIMELINE: "Timeline",
  OPPORTUNITIES: "Opportunities",
  CUSTOMERS: "Customers",
  FEATURE_CATALOG: "Feature_Catalog",
  PLAN_CATALOG: "Plan_Catalog",
  INDUSTRY_CATALOG: "Industry_Catalog",
  LEAD_SOURCES: "Lead_Sources",
  OBJECTIONS: "Objections",
  SCORING_RULES: "Scoring_Rules",
  SETTINGS: "Settings",
  EMAIL_TEMPLATES: "Email_Templates",
} as const;

export type TabName = (typeof TABS)[keyof typeof TABS];

/** Header row for every tab, in column order. Carried over from the V2 draft workbook. */
export const HEADERS: Record<TabName, string[]> = {
  [TABS.PROSPECTS]: [
    "id", "businessName", "industry", "subIndustry", "serviceType", "website",
    "phone", "email", "city", "region", "country", "instagram", "facebook",
    "linkedin", "primaryContactName", "primaryContactRole", "isDecisionMaker",
    "source", "sourceDetail", "status", "dateAdded", "lastContact",
    "lastContactChannel", "nextFollowUp", "contactAttempts", "notes",
  ],
  [TABS.RESEARCH]: [
    "prospectId", "hasWebsite", "websiteQuality", "googleRating", "reviewCount",
    "yearsInBusiness", "socialFollowers", "techStack", "decisionMaker",
    "painPoints", "researchNotes", "researchedAt",
  ],
  [TABS.QUALIFICATION]: [
    "prospectId", "fitScore", "buyingLikelihood", "totalScore", "temperature",
    "bestTimeToCall", "busySeason", "slowSeason", "followUpAfter",
    "seasonalNotes", "priority",
  ],
  [TABS.ACTIVITIES]: [
    "id", "prospectId", "date", "activityType", "outcome", "objection",
    "summary", "followUpRequired", "followUpDate", "nextAction",
  ],
  [TABS.TIMELINE]: ["id", "prospectId", "date", "note"],
  [TABS.OPPORTUNITIES]: [
    "id", "prospectId", "name", "plan", "stage", "probability", "dealValue",
    "mrr", "setupFee", "expectedClose", "closedAt", "lostReason", "notes",
  ],
  [TABS.CUSTOMERS]: [
    "id", "prospectId", "plan", "mrr", "setupFee", "startDate", "status",
    "renewalDate", "expansionOpportunity", "notes",
  ],
  [TABS.FEATURE_CATALOG]: [
    "id", "module", "feature", "description", "minimumTier", "salesValue",
    "bestFitIndustries", "painPointSolved", "salesTalkingPoint",
  ],
  [TABS.PLAN_CATALOG]: [
    "plan", "monthlyPriceCad", "storage", "teamSeats", "products",
    "customerProfiles", "salesChannels", "locations", "support", "positioning",
  ],
  [TABS.INDUSTRY_CATALOG]: [
    "industry", "subIndustry", "priority", "peakFit", "typicalWorkflow",
    "typicalPainPoints", "featuresToEmphasize", "notes",
  ],
  [TABS.LEAD_SOURCES]: ["source", "sourceType", "howObtained", "expectedQuality", "notes"],
  [TABS.OBJECTIONS]: ["objection", "category", "suggestedResponse", "followUpAction", "notes"],
  [TABS.SCORING_RULES]: ["component", "weight", "howScored", "dataInputs", "purpose"],
  [TABS.SETTINGS]: ["setting", "value", "description"],
  [TABS.EMAIL_TEMPLATES]: ["id", "name", "subject", "body", "industry"],
};
