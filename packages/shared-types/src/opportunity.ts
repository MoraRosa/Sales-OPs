export type PipelineStage =
  | "discovery"
  | "demo"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Opportunity {
  id: string;
  prospectId: string;
  name: string;
  plan?: string;
  stage: PipelineStage;
  probability?: number; // 0-100
  dealValue?: number;
  mrr?: number;
  setupFee?: number;
  expectedClose?: string;
  closedAt?: string;
  lostReason?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  prospectId: string;
  plan: string;
  mrr: number;
  setupFee?: number;
  startDate: string;
  status: "active" | "paused" | "churned";
  renewalDate?: string;
  expansionOpportunity?: string;
  notes?: string;
}
