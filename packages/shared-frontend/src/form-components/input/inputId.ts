/** Stable, focusable DOM id derived from a submission path (e.g. "person.name" -> "input-person-name"). */
const inputId = (submissionPath: string): string => `input-${submissionPath.replace(/[.[\]]/g, '-')}`;

export { inputId };
