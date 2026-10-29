import { fail } from './errors.mjs';

const asNonEmptyString = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) {
    fail(`${field} must be a non-empty string`);
  }
  return value.trim();
};

const asStringArray = (value, field) => {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    fail(`${field} must be an array of strings`);
  }
  return value;
};

const asHttpUrl = (value, field) => {
  const text = asNonEmptyString(value, field);
  let url;
  try {
    url = new URL(text);
  } catch {
    fail(`${field} must be a valid URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    fail(`${field} must use http or https`);
  }
  return url.toString();
};

export { asHttpUrl, asNonEmptyString, asStringArray };
