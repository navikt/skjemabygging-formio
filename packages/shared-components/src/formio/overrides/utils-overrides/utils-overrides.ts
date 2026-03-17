import { formDiffingUtils, navFormioUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { Formio, Utils } from 'formiojs';
import baseComponentUtils from '../../components/base/baseComponentUtils';

declare global {
  interface Window {
    _: unknown;
  }
}

const navFormDiffToHtml = (diffSummary) => {
  try {
    const { changesToCurrentComponent, deletedComponents } = diffSummary;
    const html: string[] = [];
    if (changesToCurrentComponent.length) {
      const labelId = 'nav-form-diff-changed-elements';
      html.push(`<span id="${labelId}" class="aksel-body-short font-ax-bold">Endringer</span>`);
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
      html.push(`<span id="${labelId}" class="aksel-body-short font-ax-bold">Slettede elementer</span>`);
      html.push(createList(deletedComponents, labelId));
    }
    return html.join('');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to render form diff: ${message} diffSummery="${JSON.stringify(diffSummary)}"`, err);
    return '<span>Det oppstod dessverre en feil under behandling av endringene i dette skjemaet.</span>';
  }
};

const createList = (components, labelId?: string) => {
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
  `<span class="aksel-tag aksel-tag--${level} aksel-tag--xsmall aksel-detail aksel-detail--small" data-testid="diff-tag">${text}</span>`;

const getBuilderTags = (ctx) => {
  const { component, config, self, instance } = ctx;
  const { publishedForm } = config;

  if (ctx.builder) {
    // Formio.js invokes mergeSchema on component which is put on ctx object. Therefore we must do the same
    // prior to comparing with published version to avoid misleading diff tags due to changes in a component's schema.
    const mergeSchema = self.mergeSchema.bind(self);
    const diff = formDiffingUtils.getComponentDiff(component, publishedForm, mergeSchema);
    const tags: string[] = [];
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
  const forms: unknown[] = [];
  const formioWithForms = Formio as typeof Formio & {
    forms?: Record<string, { submission?: { data: unknown } }>;
  };

  if (formioWithForms.forms) {
    for (const [_id, form] of Object.entries(formioWithForms.forms)) {
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
const utilsWithLodash = Utils as typeof Utils & { _: unknown };
if (utilsWithLodash._ && !window._) {
  window._ = utilsWithLodash._;
}

export default UtilsOverrides;
