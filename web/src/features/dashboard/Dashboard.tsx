import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../../lib/api.js";

/** "Who should I call today?" -- the whole point of the app. */
export function Dashboard() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["callQueue"],
    queryFn: api.callQueue,
  });

  const totals = useQuery({
    queryKey: ["opportunities"],
    queryFn: api.getOpportunities,
  });

  const qualify = useMutation({
    mutationFn: api.qualifyProspect,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["callQueue"] }),
  });

  if (isLoading) return <p className="text-slate-400">Loading call queue...</p>;
  if (isError) return <p className="text-red-400">Could not load the call queue.</p>;

  const queue = data?.queue ?? [];

  return (
    <div className="space-y-4">
      {totals.data ? (
        <div className="flex gap-6 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-400">
          <span>
            Pipeline: <span className="text-slate-200">${totals.data.totals.dealValueInFlight.toLocaleString()}</span>
          </span>
          <span>
            MRR in flight: <span className="text-slate-200">${totals.data.totals.mrrInFlight.toLocaleString()}</span>
          </span>
        </div>
      ) : null}

      {queue.length === 0 ? (
        <p className="text-slate-400">
          Nothing in the queue yet. Head to Discovery to find your first prospects.
        </p>
      ) : (
        <div className="space-y-3">
          {queue.map((row) => (
            <div
              key={row.id as string}
              className="rounded-lg border border-slate-800 bg-slate-900 p-4"
            >
              <Link to={`/prospects/${row.id as string}`} className="block hover:opacity-90">
                <div className="flex items-baseline justify-between">
                  <span className="font-medium">{row.businessName as string}</span>
                  <span className="text-xs uppercase text-slate-500">
                    {(row.qualification as { priority?: string } | undefined)?.priority ?? "unscored"}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {row.city as string} - {row.industry as string}
                </p>
                {row.nextFollowUp ? (
                  <p className="mt-1 text-sm text-amber-400">
                    Follow up: {row.nextFollowUp as string}
                  </p>
                ) : null}
                {row.lastContact ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Last touch: {row.lastContact as string}
                    {row.lastContactChannel ? ` (${row.lastContactChannel as string})` : ""}
                  </p>
                ) : null}
              </Link>
              {!row.qualification ? (
                <button
                  className="mt-2 text-xs text-slate-400 underline hover:text-slate-200 disabled:opacity-50"
                  disabled={qualify.isPending}
                  onClick={() => qualify.mutate(row.id as string)}
                >
                  {qualify.isPending ? "Scoring..." : "Score this prospect"}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
