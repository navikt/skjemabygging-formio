import { formDiffingTool, navFormioUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { Formio, Utils } from "formiojs";

Formio.Utils.toggleClass = (id, className) => {
  return `document.getElementById('${id}').classList.toggle('${className}')`;
};

Utils.translateHTMLTemplate = (template, translate) => {
  return translate(template);
};

const navFormDiffToHtml = (diffSummary) => {
  try {
    const { changesToCurrentComponent, deletedComponents } = diffSummary;
    const html = [];
    if (changesToCurrentComponent.length) {
      const labelId = "nav-form-diff-changed-elements";
      html.push(`<span id="${labelId}" class="skjemaelement__label">Endringer</span>`);
      html.push(`<ul aria-labelledby="${labelId}">`);
      html.push(
        ...changesToCurrentComponent.map(
          (change) => `<li>${change.key}: Fra '${change.oldValue}' til '${change.newValue}'</li>`
        )
      );
      html.push("</ul>");
    }
    if (deletedComponents.length) {
      const labelId = "nav-form-diff-deleted-elements";
      html.push(`<span id="${labelId}" class="skjemaelement__label">Slettede elementer</span>`);
      html.push(createList(deletedComponents, labelId));
    }
    return html.join("");
  } catch (err) {
    console.error(`Failed to render form diff: ${err.message} diffSummery="${JSON.stringify(diffSummary)}"`, err);
    return "<span>Det oppstod dessverre en feil under behandling av endringene i dette skjemaet.</span>";
  }
};

const createList = (components, labelId) => {
  if (components && components.length > 0) {
    const labelledBy = labelId ? ` aria-labelledby="${labelId}"` : "";
    return `<ul${labelledBy}>`
      .concat(
        components
          .map((component) => {
            return `<li>${component.type}: ${component.label}${createList(component.components)}</li>`;
          })
          .join("")
      )
      .concat("</ul>");
  }
  return "";
};
Formio.Utils.navFormDiffToHtml = navFormDiffToHtml;

const TAG = (text) =>
  `<span class="navds-tag navds-tag--warning-filled navds-tag--xsmall navds-detail navds-detail--small">${text}</span>`;

const getDiffTag = (ctx) => {
  const { component, config } = ctx;
  const { publishedForm } = config;
  if (ctx.builder && publishedForm) {
    const diff = formDiffingTool.getComponentDiff(component, publishedForm);
    const tags = [];
    if (diff.isNew) {
      tags.push(`${TAG("Ny")}`);
    }
    if (diff.changesToCurrentComponent?.length) {
      tags.push(`${TAG("Endring")}`);
    }
    if (diff.deletedComponents?.length) {
      tags.push(`${TAG("Slettede elementer")}`);
    }
    return tags.join(" ");
  }
  return "";
};
Formio.Utils.getDiffTag = getDiffTag;

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

export { evaluateOverride, sanitizeJavaScriptCode, navFormDiffToHtml, getDiffTag };
