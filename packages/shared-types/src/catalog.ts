/** Reference/config data -- read by the scoring engine, not written by reps. */
export interface FeatureCatalogItem {
  id: string;
  module: string;
  feature: string;
  description: string;
  minimumTier: string;
  salesValue: "Low" | "Medium" | "High" | "Very High";
  bestFitIndustries: string[];
  painPointSolved: string;
  salesTalkingPoint: string;
}

export interface PlanCatalogItem {
  plan: string;
  monthlyPriceCad: string; // numeric string, or "Custom" for Enterprise
  storage: string;
  teamSeats: string; // numeric string, or "Unlimited"
  products: string;
  customerProfiles: string;
  salesChannels: string;
  locations: string;
  support: string;
  positioning: string;
}

export interface IndustryCatalogItem {
  industry: string;
  subIndustry?: string;
  priority: "low" | "medium" | "high";
  peakFit: number; // 0-100, read by the scoring engine
  typicalWorkflow?: string;
  typicalPainPoints: string[];
  featuresToEmphasize: string[];
  notes?: string;
}

export interface LeadSourceCatalogItem {
  source: string;
  sourceType: string;
  howObtained: string;
  expectedQuality: string;
  notes?: string;
}

export interface ObjectionCatalogItem {
  objection: string;
  category: string;
  suggestedResponse: string;
  followUpAction?: string;
  notes?: string;
}

export interface ScoringRule {
  component: string;
  weight: number;
  howScored: string;
  dataInputs: string[];
  purpose?: string;
}

/** Body supports {{businessName}} / {{industry}} style placeholders -- see applyTemplate(). */
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  industry?: string;
}
