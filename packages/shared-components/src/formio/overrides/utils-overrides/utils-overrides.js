import fnrvalidator from '@navikt/fnrvalidator';
import { formDiffingTool, navFormioUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Utils } from 'formiojs';
import moment from 'moment/moment';
import '../moment-overrides';

const additionalDescription = (ctx) => {
  if (!ctx.component.additionalDescriptionLabel && !ctx.component.additionalDescriptionText) return '';

  const descriptionId = `${ctx.component.id}-${ctx.component.key}-additional-description`;
  const descriptionButtonId = `${ctx.component.id}-${ctx.component.key}-additional-button-content`;
  const descriptionContentId = `${ctx.component.id}-${ctx.component.key}-additional-description-content`;

  return `<div class="navds-read-more navds-read-more--medium" id="${descriptionId}">
    <button type="button" class="navds-read-more__button navds-body-short" aria-expanded="true" id="${descriptionButtonId}" onclick="(() => {          
      document.getElementById('${descriptionId}').classList.toggle('navds-read-more--open');          
      document.getElementById('${descriptionContentId}').classList.toggle('navds-read-more__content--closed');
      document.getElementById('${descriptionContentId}').setAttribute(
        'aria-hidden', (!document.getElementById('${descriptionContentId}').getAttribute('aria-hidden')).toString()
      );          
      document.getElementById('${descriptionButtonId}').setAttribute(
        'aria-expanded', (!document.getElementById('${descriptionButtonId}').getAttribute('aria-expanded')).toString()
      );
      })()">      
      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false" role="img" class="navds-read-more__expand-icon" aria-hidden="true">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M5.97 9.47a.75.75 0 0 1 1.06 0L12 14.44l4.97-4.97a.75.75 0 1 1 1.06 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-5.5-5.5a.75.75 0 0 1 0-1.06Z" fill="currentColor"></path>
      </svg>
      <span>${ctx.t(ctx.component.additionalDescriptionLabel)}</span>
    </button>
    <div class="navds-read-more__content navds-read-more__content--closed" id="${descriptionContentId}" aria-hidden="true">
      ${ctx.t(ctx.component.additionalDescriptionText)}  
    </div>
  </div>`;
};

const translateHTMLTemplate = (template, translate) => {
  return translate(template);
};

const navFormDiffToHtml = (diffSummary) => {
  try {
    const { changesToCurrentComponent, deletedComponents } = diffSummary;
    const html = [];
    if (changesToCurrentComponent.length) {
      const labelId = 'nav-form-diff-changed-elements';
      html.push(`<span id="${labelId}" class="navds-body-short font-bold">Endringer</span>`);
      html.push(`<ul aria-labelledby="${labelId}">`);
      html.push(
        ...changesToCurrentComponent.map(
          (change) => `<li>${change.key}: Fra '${change.oldValue}' til '${change.newValue}'</li>`,
        ),
      );
      html.push('</ul>');
    }
    if (deletedComponents.length) {
      const labelId = 'nav-form-diff-deleted-elements';
      html.push(`<span id="${labelId}" class="navds-body-short font-bold">Slettede elementer</span>`);
      html.push(createList(deletedComponents, labelId));
    }
    return html.join('');
  } catch (err) {
    console.error(`Failed to render form diff: ${err.message} diffSummery="${JSON.stringify(diffSummary)}"`, err);
    return '<span>Det oppstod dessverre en feil under behandling av endringene i dette skjemaet.</span>';
  }
};

const createList = (components, labelId) => {
  if (components && components.length > 0) {
    const labelledBy = labelId ? ` aria-labelledby="${labelId}"` : '';
    return `<ul${labelledBy}>`
      .concat(
        components
          .map((component) => {
            return `<li>${component.type}: ${component.label}${createList(component.components)}</li>`;
          })
          .join(''),
      )
      .concat('</ul>');
  }
  return '';
};

const TAG = (text) =>
  `<span class="navds-tag navds-tag--warning navds-tag--xsmall navds-detail navds-detail--small">${text}</span>`;

const getDiffTag = (ctx) => {
  const { component, config, self } = ctx;
  const { publishedForm } = config;
  if (ctx.builder && publishedForm) {
    // Formio.js invokes mergeSchema on component which is put on ctx object. Therefore we must do the same
    // prior to comparing with published version to avoid misleading diff tags due to changes in a component's schema.
    const mergeSchema = self.mergeSchema.bind(self);
    const diff = formDiffingTool.getComponentDiff(component, publishedForm, mergeSchema);
    const tags = [];
    if (diff.isNew) {
      tags.push(`${TAG('Ny')}`);
    }
    if (diff.changesToCurrentComponent?.length) {
      tags.push(`${TAG('Endring')}`);
    }
    if (diff.deletedComponents?.length) {
      tags.push(`${TAG('Slettede elementer')}`);
    }
    return tags.join(' ');
  }
  return '';
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
const sanitize = (string, options) => {
  return originalSanitize(originalSanitize(string, options), options);
};

const originalEvaluate = Utils.evaluate;

const evaluate = (func, args, ret, tokenize) => {
  return originalEvaluate(sanitizeJavaScriptCode(func), args, ret, tokenize);
};

const { sanitizeJavaScriptCode } = navFormioUtils;

const isBornBeforeYear = (year, fnrKey, submission = {}) => {
  const value = Utils.getValue(submission, fnrKey);
  if (value && fnrvalidator.fnr(value.trim()).status === 'valid') {
    const birthDateStr = value.substring(0, 6);
    return moment(birthDateStr, 'DDMMYY').year() < year;
  }
  return false;
};

const UtilsOverrides = {
  additionalDescription,
  translateHTMLTemplate,
  evaluate,
  sanitize,
  sanitizeJavaScriptCode,
  navFormDiffToHtml,
  getDiffTag,
  isBornBeforeYear,
};

if (typeof global === 'object' && global.FormioUtils) {
  Object.entries(UtilsOverrides).forEach(([key, value]) => {
    Utils[key] = value;
    // FormioUtils is set on global scope by Formio if global is object
    global.FormioUtils[key] = value;
  });
}

// Formio require lodash to be available on window for custom conditionals.
if (!!Utils._ && !window._) {
  window._ = Utils._;
}

export default UtilsOverrides;
