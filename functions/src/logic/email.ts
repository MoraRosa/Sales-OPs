/**
 * Replaces {{key}} placeholders in a template body/subject with real
 * prospect values. Unmatched placeholders are left as-is rather than
 * silently blanked -- a visible {{industry}} in a sent email is a
 * bug you'll notice; a silently blank spot might not be.
 */
export function applyTemplate(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : match;
  });
}

export function buildEmailTimelineNote(subject: string): string {
  return `Sent email: ${subject}`;
}
