import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api.js";

const OUTCOME_OPTIONS: { value: string; label: string }[] = [
  { value: "no_answer", label: "No answer" },
  { value: "voicemail", label: "Left voicemail" },
  { value: "not_interested", label: "Not interested" },
  { value: "interested", label: "Interested" },
  { value: "callback_requested", label: "Callback requested" },
  { value: "demo_booked", label: "Demo booked" },
  { value: "wrong_number", label: "Wrong number" },
];

/** The "story so far" for one prospect, plus a form to add the next entry. */
export function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["prospectDetail", id],
    queryFn: () => api.getProspectDetail(id!),
    enabled: Boolean(id),
  });

  if (!id) return null;
  if (isLoading) return <p className="text-slate-400">Loading...</p>;
  if (isError || !data) return <p className="text-red-400">Could not load this prospect.</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          &lt;- Back to call queue
        </Link>
        <h2 className="mt-2 text-xl font-medium">{data.prospect.businessName}</h2>
        <p className="text-sm text-slate-400">
          {data.prospect.city} - {data.prospect.industry}
          {data.qualification?.priority ? ` - ${data.qualification.priority} priority` : ""}
        </p>
        <ContactInfo prospect={data.prospect} />
      </div>

      <LogCallForm
        prospectId={id}
        onLogged={() => {
          queryClient.invalidateQueries({ queryKey: ["prospectDetail", id] });
          queryClient.invalidateQueries({ queryKey: ["callQueue"] });
        }}
      />

      <CreateOpportunityForm
        prospectId={id}
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["opportunities"] })}
      />

      {data.prospect.email ? (
        <SendEmailForm
          prospectId={id}
          onSent={() => queryClient.invalidateQueries({ queryKey: ["prospectDetail", id] })}
        />
      ) : (
        <p className="text-xs text-slate-500">
          No email on file for this prospect -- add one via quick-add or "Find owner contact" above.
        </p>
      )}

      <section>
        <h3 className="mb-3 text-sm font-medium uppercase text-slate-500">Timeline</h3>
        {data.timeline.length === 0 ? (
          <p className="text-sm text-slate-500">No history yet -- log the first call above.</p>
        ) : (
          <ol className="space-y-3 border-l border-slate-800 pl-4">
            {data.timeline.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs text-slate-500">{entry.date}</p>
                <p className="text-sm">{entry.note}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function CreateOpportunityForm({ prospectId, onCreated }: { prospectId: string; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [mrr, setMrr] = useState("");
  const [created, setCreated] = useState(false);

  const create = useMutation({
    mutationFn: () =>
      api.createOpportunity({
        prospectId,
        name,
        dealValue: dealValue ? Number(dealValue) : undefined,
        mrr: mrr ? Number(mrr) : undefined,
      }),
    onSuccess: () => {
      setCreated(true);
      onCreated();
    },
  });

  if (created) {
    return (
      <p className="text-sm text-emerald-400">
        Opportunity created. Track it from the Opportunities page.
      </p>
    );
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 text-sm font-medium uppercase text-slate-500">Start an opportunity</h3>
      <div className="space-y-2">
        <input
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Opportunity name, e.g. Peak Starter plan"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Deal value ($)"
            value={dealValue}
            onChange={(e) => setDealValue(e.target.value)}
          />
          <input
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="MRR ($/mo)"
            value={mrr}
            onChange={(e) => setMrr(e.target.value)}
          />
        </div>
        <button
          className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
          disabled={!name || create.isPending}
          onClick={() => create.mutate()}
        >
          {create.isPending ? "Creating..." : "Create opportunity"}
        </button>
      </div>
    </section>
  );
}

function ContactInfo({ prospect }: { prospect: Record<string, string> }) {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [manualEmail, setManualEmail] = useState("");
  const [showManualForm, setShowManualForm] = useState(false);

  const enrich = useMutation({
    mutationFn: () => api.enrichProspect(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prospectDetail", id] }),
  });

  const addManually = useMutation({
    mutationFn: () => api.updateProspectContact({ prospectId: id!, email: manualEmail }),
    onSuccess: () => {
      setManualEmail("");
      setShowManualForm(false);
      queryClient.invalidateQueries({ queryKey: ["prospectDetail", id] });
    },
  });

  if (prospect.primaryContactName || prospect.email) {
    return (
      <p className="mt-1 text-sm text-slate-300">
        {prospect.primaryContactName}
        {prospect.primaryContactRole ? ` (${prospect.primaryContactRole})` : ""}
        {prospect.email ? ` - ${prospect.email}` : ""}
      </p>
    );
  }

  if (showManualForm) {
    return (
      <div className="mt-1 flex gap-2">
        <input
          className="rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
          placeholder="Email you found by hand"
          value={manualEmail}
          onChange={(e) => setManualEmail(e.target.value)}
        />
        <button
          className="text-xs text-emerald-400 underline disabled:opacity-50"
          disabled={!manualEmail || addManually.isPending}
          onClick={() => addManually.mutate()}
        >
          {addManually.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-1 flex gap-3">
      <button
        className="text-xs text-slate-400 underline hover:text-slate-200 disabled:opacity-50"
        disabled={enrich.isPending}
        onClick={() => enrich.mutate()}
      >
        {enrich.isPending
          ? "Looking up contact..."
          : enrich.data && !enrich.data.found
            ? "No contact found"
            : "Find owner contact (Apollo)"}
      </button>
      <button
        className="text-xs text-slate-400 underline hover:text-slate-200"
        onClick={() => setShowManualForm(true)}
      >
        Add email manually
      </button>
    </div>
  );
}

function SendEmailForm({ prospectId, onSent }: { prospectId: string; onSent: () => void }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const templatesQuery = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: api.getEmailTemplates,
  });

  const send = useMutation({
    mutationFn: () => api.sendColdEmail({ prospectId, subject, body }),
    onSuccess: () => {
      setSent(true);
      onSent();
    },
  });

  const applyTemplateChoice = (templateId: string) => {
    const template = templatesQuery.data?.templates.find((t) => t.id === templateId);
    if (template) {
      setSubject(template.subject);
      setBody(template.body);
    }
  };

  if (sent) {
    return <p className="text-sm text-emerald-400">Email sent and logged to the timeline.</p>;
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 text-sm font-medium uppercase text-slate-500">Send a cold email</h3>
      <div className="space-y-2">
        {templatesQuery.data && templatesQuery.data.templates.length > 0 ? (
          <select
            className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            defaultValue=""
            onChange={(e) => applyTemplateChoice(e.target.value)}
          >
            <option value="" disabled>
              Start from a template (optional)
            </option>
            {templatesQuery.data.templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        ) : null}
        <input
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <textarea
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="Body -- {{businessName}} and {{industry}} get filled in automatically"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button
          className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
          disabled={!subject || !body || send.isPending}
          onClick={() => send.mutate()}
        >
          {send.isPending ? "Sending..." : "Send email"}
        </button>
        {send.isError ? (
          <p className="text-xs text-red-400">Could not send -- check the Functions logs.</p>
        ) : null}
      </div>
    </section>
  );
}

function LogCallForm({ prospectId, onLogged }: { prospectId: string; onLogged: () => void }) {
  const [outcome, setOutcome] = useState("no_answer");
  const [summary, setSummary] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [nextAction, setNextAction] = useState("");

  const logCall = useMutation({
    mutationFn: () => api.logCall({ prospectId, outcome, summary, followUpDate, nextAction }),
    onSuccess: () => {
      setSummary("");
      setFollowUpDate("");
      setNextAction("");
      onLogged();
    },
  });

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 text-sm font-medium uppercase text-slate-500">Log a call</h3>
      <div className="space-y-2">
        <select
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        >
          {OUTCOME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <textarea
          className="w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          placeholder="What happened on the call?"
          rows={2}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
        <div className="flex gap-2">
          <input
            type="date"
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
          <input
            className="flex-1 rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            placeholder="Next action"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
          />
        </div>
        <button
          className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
          disabled={logCall.isPending}
          onClick={() => logCall.mutate()}
        >
          {logCall.isPending ? "Saving..." : "Log call"}
        </button>
      </div>
    </section>
  );
}