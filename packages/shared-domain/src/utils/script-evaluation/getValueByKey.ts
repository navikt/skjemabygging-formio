type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

// Component keys only contain word characters, '-' and '.', so a key is either an own property or a dot path.
const findOwnPath = (data: PlainObject, key: string): { found: boolean; value?: unknown } => {
  let current: unknown = data;
  for (const segment of key in data || !key.includes('.') ? [key] : key.split('.')) {
    if (current === null || current === undefined || !Object.hasOwn(Object(current), segment)) {
      return { found: false };
    }
    current = (current as PlainObject)[segment];
  }

  return { found: true, value: current };
};

/**
 * Copy of Formio's getValue (formiojs 4.20.0, utils/formUtils.js), so the new renderer can use it
 * without Formio. The key is looked up in submission.data first, then depth-first through nested
 * objects (not arrays), and the first value that is not null or undefined wins.
 */
const getValueByKey = (submission: { data?: unknown }, componentKey: string): unknown => {
  // Scripts are untyped. Like lodash, treat a non-string key such as undefined or 5 as the property name 'undefined' or '5'.
  const key = String(componentKey);
  const search = (data: unknown): unknown => {
    if (!isPlainObject(data)) {
      return null;
    }

    const own = findOwnPath(data, key);
    if (own.found) {
      return own.value;
    }

    for (const prop of Object.values(data)) {
      const result = search(prop);
      if (result !== null && result !== undefined) {
        return result;
      }
    }

    return null;
  };

  return search(submission.data);
};

export { getValueByKey };
