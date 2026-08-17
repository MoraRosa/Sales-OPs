import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api.js";

const STAGE_OPTIONS = ["discovery", "demo", "proposal", "negotiation"];

export function Opportunities() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["opportunities"],
    queryFn: api.getOpportunities,
  });

  const updateStage = useMutation({
    mutationFn: api.updateOpportunityStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["callQueue"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  if (isLoading) return <p className="text-slate-400">Loading opportunities...</p>;
  if (isError || !data) return <p className="text-red-400">Could not load opportunities.</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex gap-6 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
        <div>
          <p className="text-slate-500">Deal value in flight</p>
          <p className="text-lg font-medium">${data.totals.dealValueInFlight.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">MRR in flight</p>
          <p className="text-lg font-medium">${data.totals.mrrInFlight.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-500">Open opportunities</p>
          <p className="text-lg font-medium">{data.totals.countInFlight}</p>
        </div>
      </div>

      {data.opportunities.length === 0 ? (
        <p className="text-sm text-slate-500">
          No opportunities yet -- create one from a prospect's detail page once they're qualified.
        </p>
      ) : (
        <div className="space-y-3">
          {data.opportunities.map((o) => (
            <div key={o.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{o.businessName}</span>
                <span className="text-xs uppercase text-slate-500">{o.stage}</span>
              </div>
              <p className="text-sm text-slate-400">
                {o.name} {o.dealValue ? `- $${o.dealValue} deal` : ""} {o.mrr ? `- $${o.mrr}/mo` : ""}
              </p>

              {o.stage !== "won" && o.stage !== "lost" ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
                    value={o.stage}
                    onChange={(e) =>
                      updateStage.mutate({ opportunityId: o.id, stage: e.target.value })
                    }
                  >
                    {STAGE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    className="rounded bg-emerald-900 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-800"
                    onClick={() => updateStage.mutate({ opportunityId: o.id, stage: "won" })}
                  >
                    Mark won
                  </button>
                  <button
                    className="rounded bg-red-950 px-2 py-1 text-xs text-red-300 hover:bg-red-900"
                    onClick={() => {
                      const reason = window.prompt("Why was this lost?") ?? "";
                      updateStage.mutate({ opportunityId: o.id, stage: "lost", lostReason: reason });
                    }}
                  >
                    Mark lost
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
