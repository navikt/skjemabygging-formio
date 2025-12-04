import { formDiffingTool, navFormioUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Formio, Utils } from 'formiojs';
import baseComponentUtils from '../../components/base/baseComponentUtils.js';

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

const TAG = (text, level = 'warning') =>
  `<span class="navds-tag navds-tag--${level} navds-tag--xsmall navds-detail navds-detail--small" data-testid="diff-tag">${text}</span>`;

const getBuilderTags = (ctx) => {
  const { component, config, self, instance } = ctx;
  const { publishedForm } = config;

  if (ctx.builder) {
    // Formio.js invokes mergeSchema on component which is put on ctx object. Therefore we must do the same
    // prior to comparing with published version to avoid misleading diff tags due to changes in a component's schema.
    const mergeSchema = self.mergeSchema.bind(self);
    const diff = formDiffingTool.getComponentDiff(component, publishedForm, mergeSchema);
    const tags = [];
    if (publishedForm && diff.isNew) {
      tags.push(`${TAG('Ny')}`);
    }
    if (publishedForm && diff.changesToCurrentComponent?.length) {
      tags.push(`${TAG('Endring')}`);
    }
    if (publishedForm && diff.deletedComponents?.length) {
      tags.push(`${TAG('Slettede elementer')}`);
    }
    baseComponentUtils.getBuilderErrors(component, instance?.parent).forEach((error) => {
      tags.push(TAG(error, 'error'));
    });
    return tags.join(' ');
  }
  return '';
};

/**
 * This is a helper function for developers to easily access submission data from browser console
 */
const data = () => {
  let forms = [];
  if (Formio.forms) {
    for (const [_id, form] of Object.entries(Formio.forms)) {
      forms.push(form?.submission?.data);
    }
  }

  return forms;
};

const UtilsOverrides = {
  ...navFormioUtils.overrideFunctionNames
    .map((fnName) => [fnName, navFormioUtils[fnName]])
    .reduce((acc, [fnName, fnValue]) => ({ ...acc, [fnName]: fnValue }), {}),
  navFormDiffToHtml,
  getBuilderTags,
  data,
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
