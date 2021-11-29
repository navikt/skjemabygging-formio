import { Utils } from "formiojs";
import { sanitizeJavaScriptCode } from "./conditional-overrides";

const originalEvaluate = Utils.evaluate;

function evaluateOverride(func, args, ret, tokenize) {
  return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
}

export { evaluateOverride };
