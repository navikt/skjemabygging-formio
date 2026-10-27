/**
 * Minimal connection to a state inspector such as the Redux DevTools browser extension. The host
 * creates it, so shared code never touches `window` and decides nothing about when it is enabled.
 */
interface DevtoolsConnection {
  init: (state: unknown) => void;
  send: (action: { type: string }, state: unknown) => void;
}

type DevtoolsReport = (slice: string, value: unknown, label?: string) => void;

// `ancestors` holds only the objects on the current path, so repeated references that are not
// cycles are kept.
const convertObject = (value: object, ancestors: WeakSet<object>): unknown => {
  if (value instanceof Error) {
    return { name: value.name, message: value.message };
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return { blobType: value.type, size: value.size };
  }
  if (value instanceof Set) {
    return [...value].map((item) => toSerializable(item, ancestors));
  }
  if (value instanceof Map) {
    return Object.fromEntries([...value].map(([key, item]) => [String(key), toSerializable(item, ancestors)]));
  }
  if (Array.isArray(value)) {
    return value.map((item) => toSerializable(item, ancestors));
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => typeof item !== 'function')
      .map(([key, item]) => [key, toSerializable(item, ancestors)]),
  );
};

// The extension serializes with JSON, which renders Set, Map and Error as empty objects.
const toSerializable = (value: unknown, ancestors = new WeakSet<object>()): unknown => {
  if (typeof value === 'function') {
    return undefined;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (ancestors.has(value)) {
    return '[Circular]';
  }
  ancestors.add(value);
  const result = convertObject(value, ancestors);
  ancestors.delete(value);
  return result;
};

/**
 * Combines independently reported slices into one state, so every change appears in a single
 * timeline labelled `<slice>/<label>`.
 */
const createDevtoolsReport = (connection: DevtoolsConnection): DevtoolsReport => {
  let state: Record<string, unknown> = {};
  connection.init(state);

  return (slice, value, label = 'update') => {
    state = { ...state, [slice]: toSerializable(value) };
    connection.send({ type: `${slice}/${label}` }, state);
  };
};

export { createDevtoolsReport, toSerializable };
export type { DevtoolsConnection, DevtoolsReport };
