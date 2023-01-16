import { formDiffingTool, navFormioUtils, navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { Formio, Utils } from "formiojs";

Formio.Utils.toggleClass = (id, className) => {
  return `document.getElementById('${id}').classList.toggle('${className}')`;
};

const TAG = (text) =>
  `<span class="navds-tag navds-tag--warning-filled navds-tag--xsmall navds-detail navds-detail--small">${text}</span>`;

Formio.Utils.getDiffTag = (ctx) => {
  const { component, config } = ctx;
  const { publishedForm } = config;
  if (ctx.builder && publishedForm) {
    const changes = formDiffingTool.checkComponentDiff(component, publishedForm);
    if (component.type === "panel" && changes && changes.components) {
      const deletedComponents = navFormUtils
        .flattenComponents(changes.components)
        .filter((compDiff) => compDiff.status === "Slettet");
      return deletedComponents.length > 0 ? TAG("Slettede elementer") : "";
    } else if (changes && changes.status) {
      return `${TAG(changes.status)}`;
    }
  }
  return "";
};

/*
 * This function is overridden because FormioUtils.sanitize calls dompurify.sanitize, which has a bug.
 * The bug is discussed here: https://github.com/cure53/DOMPurify/issues/276
 * In short, it reverses the order of attributes on HTML elements.
 *
 * For us, this breaks translations, as the text to be translated no longer matches the text in the translation file.
 *
 * By calling the sanitize-function twice, we reverse the reversed order, causing the original, correct order.
 * This is messy, but we consider it safer than turning off sanitizing by sending in "sanitize = false" to NavForm.
 */
const originalSanitize = Utils.sanitize;
Formio.Utils.sanitize = (string, options) => {
  return originalSanitize(originalSanitize(string, options), options);
};

const originalEvaluate = Utils.evaluate;

function evaluateOverride(func, args, ret, tokenize) {
  return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
}

const { sanitizeJavaScriptCode } = navFormioUtils;

export { evaluateOverride, sanitizeJavaScriptCode };
