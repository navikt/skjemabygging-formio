import { navFormioUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { Formio, Utils } from "formiojs";

Formio.Utils.toggleClass = (id, className) => {
  return `document.getElementById('${id}').classList.toggle('${className}')`;
};

const originalEvaluate = Utils.evaluate;

function evaluateOverride(func, args, ret, tokenize) {
  return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
}

const { sanitizeJavaScriptCode } = navFormioUtils;

export { evaluateOverride, sanitizeJavaScriptCode };
