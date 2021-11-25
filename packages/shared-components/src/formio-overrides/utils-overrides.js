import { Utils } from "formiojs";
import { sanitizeCustomConditional } from "./conditional-overrides";

const originalEvaluate = Utils.evaluate;

function evaluateOverride(func, args, ret, tokenize) {
  return originalEvaluate(sanitizeCustomConditional(func), args, ret, tokenize);
}

export { evaluateOverride };
