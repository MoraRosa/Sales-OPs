/** A single logged call or interaction. Append-only. */
export type ActivityOutcome =
  | "no_answer"
  | "voicemail"
  | "not_interested"
  | "interested"
  | "callback_requested"
  | "demo_booked"
  | "wrong_number"
  | "email_sent";

export interface Activity {
  id: string;
  prospectId: string;
  date: string;
  activityType: "call" | "email" | "text" | "meeting";
  outcome: ActivityOutcome;
  objection?: string;
  summary?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  nextAction?: string;
}

/** Append-only narrative log per prospect -- the "story so far" view. */
export interface TimelineEntry {
  id: string;
  prospectId: string;
  date: string;
  note: string; // e.g. "Called Alex. Busy season. Callback after Nov 15."
}
