import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api.js";

/** Search-based discovery (Google Places / Yelp) plus the manual quick-add form. */
export function Discovery() {
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [includeYelp, setIncludeYelp] = useState(false);

  const search = useMutation({
    mutationFn: () =>
      api.discoverProspects({
        industry,
        city,
        sources: includeYelp ? ["google_places", "yelp"] : ["google_places"],
      }),
  });

  return (
    <div className="max-w-lg space-y-8">
      <section>
        <h2 className="mb-2 text-base font-medium">Find prospects</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            placeholder="Industry, e.g. dog walker"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
          <input
            className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
            disabled={!industry || !city || search.isPending}
            onClick={() => search.mutate()}
          >
            {search.isPending ? "Searching..." : "Search"}
          </button>
        </div>
        <label className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <input
            type="checkbox"
            checked={includeYelp}
            onChange={(e) => setIncludeYelp(e.target.checked)}
          />
          Also search Yelp (catches businesses Google Places misses)
        </label>
        {search.data ? (
          <p className="mt-2 text-sm text-slate-400">
            Found {search.data.found}, added {search.data.added} new
            {search.data.skippedDuplicates > 0
              ? ` (${search.data.skippedDuplicates} already in the list)`
              : ""}
            .
          </p>
        ) : null}
      </section>

      <ManualAdd />
    </div>
  );
}

/** For the Instagram/Facebook-only businesses no API can find. */
function ManualAdd() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [instagram, setInstagram] = useState("");
  const [email, setEmail] = useState("");

  const add = useMutation({
    mutationFn: () => api.addManualProspect({ businessName, industry, instagram, email }),
    onSuccess: () => {
      setBusinessName("");
      setIndustry("");
      setInstagram("");
      setEmail("");
    },
  });

  return (
    <section>
      <h2 className="mb-2 text-base font-medium">Quick-add (no API found it)</h2>
      <div className="space-y-2">
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Business name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
        />
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Industry"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Instagram handle (optional)"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
        <input
          className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          placeholder="Email (optional, for cold email later)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
          disabled={!businessName || !industry || add.isPending}
          onClick={() => add.mutate()}
        >
          {add.isPending ? "Adding..." : "Add prospect"}
        </button>
      </div>
    </section>
  );
}
