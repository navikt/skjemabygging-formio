import type { ConditionResult } from '../check-condition/types';
import sanitizeJavascriptCode from '../formio/sanitizeJavascriptCode';

interface ScriptArgs {
  [key: string]: unknown;
  component?: { key?: string };
  form?: unknown;
  instance?: unknown;
}

const getRootForm = (instance: unknown) => {
  const rootForm = (instance as { root?: { _form?: unknown } | null }).root?._form;

  return rootForm === undefined ? {} : rootForm;
};

/**
 * Copy of navFormioUtils.evaluate for string scripts: sanitizeJavascriptCode followed by Formio's
 * evaluate (formiojs 4.20.0, utils/utils.js and utils/Evaluator.js), so the new renderer can run
 * scripts without Formio. The argument names become the script's variables, `ret` names the
 * variable to return, and a script that fails to compile or throws returns null. Unlike Formio, it
 * does not add `form` to the caller's args, and it has no `tokenize` or JSON Logic support.
 */
const evaluateScript = (func: string, args: ScriptArgs, ret?: string): ConditionResult => {
  const componentKey = args.component ? args.component.key : 'unknown';

  if (typeof func !== 'string') {
    console.warn(`Unknown function type for ${componentKey}`);
    return null;
  }

  const scriptArgs: ScriptArgs = { ...args };
  if (!scriptArgs.form && scriptArgs.instance) {
    scriptArgs.form = getRootForm(scriptArgs.instance);
  }

  let script = sanitizeJavascriptCode(func);
  if (ret) {
    script += `;return ${ret}`;
  }

  let compiled: (...values: unknown[]) => ConditionResult;
  try {
    compiled = new Function(...Object.keys(scriptArgs), script) as typeof compiled;
  } catch (err) {
    console.warn(`An error occured within the custom function for ${componentKey}`, err);
    return null;
  }

  try {
    return compiled(...Object.values(scriptArgs));
  } catch (err) {
    console.warn(`An error occured within custom function for ${componentKey}`, err);
    return null;
  }
};

export { evaluateScript };
export type { ScriptArgs };
