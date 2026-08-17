import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api.js";

export function Customers() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers"],
    queryFn: api.getCustomers,
  });

  if (isLoading) return <p className="text-slate-400">Loading customers...</p>;
  if (isError || !data) return <p className="text-red-400">Could not load customers.</p>;

  if (data.customers.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No customers yet -- they show up here automatically when an opportunity is marked won.
      </p>
    );
  }

  const totalMrr = data.customers
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + (Number(c.mrr) || 0), 0);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm">
        <p className="text-slate-500">Active MRR</p>
        <p className="text-lg font-medium">${totalMrr.toLocaleString()}</p>
      </div>

      <div className="space-y-3">
        {data.customers.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-baseline justify-between">
              <span className="font-medium">{c.businessName}</span>
              <span className="text-xs uppercase text-slate-500">{c.status}</span>
            </div>
            <p className="text-sm text-slate-400">
              {c.plan} - ${c.mrr}/mo - since {c.startDate}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
