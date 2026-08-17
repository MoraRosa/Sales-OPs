export function newOpportunityId(now: number = Date.now()): string {
  return `OPP-${now.toString(36).toUpperCase()}`;
}

export function newCustomerId(now: number = Date.now()): string {
  return `CUST-${now.toString(36).toUpperCase()}`;
}

const IN_FLIGHT_STAGES = new Set(["discovery", "demo", "proposal", "negotiation"]);

export interface PipelineTotals {
  dealValueInFlight: number;
  mrrInFlight: number;
  countInFlight: number;
}

/**
 * Sums deal value and MRR across opportunities still moving through the
 * pipeline (excludes won/lost). Tolerant of blank/non-numeric Sheet
 * cells -- a typo in one row shouldn't zero out the whole total.
 */
export function computePipelineTotals(opportunities: Record<string, string>[]): PipelineTotals {
  const inFlight = opportunities.filter((o) => IN_FLIGHT_STAGES.has(o.stage));

  const sumField = (field: string) =>
    inFlight.reduce((sum, o) => {
      const n = Number(o[field]);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);

  return {
    dealValueInFlight: sumField("dealValue"),
    mrrInFlight: sumField("mrr"),
    countInFlight: inFlight.length,
  };
}
