/**
 * Stable, focusable DOM id derived from a state path (e.g. "person.name" -> "input-person-name").
 * The field component sets this id on its input and the error summary derives the same id from the
 * path, so an error link focuses the matching field. Keep it pure and dependency-free.
 */
const inputId = (statePath: string): string => `input-${statePath.replace(/[.[\]]/g, '-')}`;

/**
 * Field name attribute derived from the last key in a state path (e.g. "address.co" -> "co").
 * Browser and password-manager autofill heuristics read the name before the id. Without it they
 * parse the id, where parent keys like "virksomhetensAdresse" make unrelated fields look like address lines.
 */
const inputName = (statePath: string): string =>
  statePath
    .replace(/\[\d+\]/g, '')
    .split('.')
    .pop() ?? '';

export { inputId, inputName };
