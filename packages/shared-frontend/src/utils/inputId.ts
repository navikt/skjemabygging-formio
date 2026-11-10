/**
 * Stable, focusable DOM id derived from a state path (e.g. "person.name" -> "input-person-name").
 * The field component sets this id on its input and the error summary derives the same id from the
 * path, so an error link focuses the matching field. Keep it pure and dependency-free.
 */
const inputId = (statePath: string): string => `input-${statePath.replace(/[.[\]]/g, '-')}`;

export { inputId };
