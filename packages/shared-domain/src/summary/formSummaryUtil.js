import moment from 'moment';
import 'moment/locale/nb';
import TEXTS from '../texts';
import dateUtils from '../utils/date';
import FormioUtils from '../utils/formio/FormioUtils';
import sanitizeJavaScriptCode from '../utils/formio/sanitize-javascript-code';
import { addToMap } from '../utils/objectUtils';
import { toPascalCase } from '../utils/stringUtils';

function createComponentKey(parentContainerKey, key) {
  return parentContainerKey.length > 0 ? `${parentContainerKey}.${key}` : key;
}

// Used when creating the evaluatedConditionalsMap
// Components can have the same key (if they are in different containers), but will always have a unique navId.
function createComponentKeyWithNavId(component) {
  return `${component.key}-${component.navId}`;
}

function formatValue(component, value, translate, form, language) {
  switch (component.type) {
    case 'radiopanel':
    case 'radio':
      const valueObject = component.values.find(
        (valueObject) => String(valueObject.value).toString() === String(value).toString(),
      );
      if (!valueObject) {
        console.log(`'${value}' is not in ${JSON.stringify(component.values)}`);
        return '';
      }
      return translate(valueObject.label);
    case 'signature': {
      console.log('rendering signature not supported');
      return '';
    }
    case 'navDatepicker': {
      if (!value) {
        return '';
      }
      return dateUtils.toLocaleDate(value);
    }
    case 'navCheckbox': {
      return value ? translate(TEXTS.common.yes) : translate(TEXTS.common.no);
    }
    case 'landvelger':
    case 'valutavelger':
      // For å sikre bakoverkompatibilitet må vi ta høyde for at value kan være string
      return translate(typeof value === 'string' ? value : value?.label);

    case 'select':
    case 'navSelect':
      if (typeof value === 'object') {
        return translate(value.label);
      }
      return translate((component.data.values.find((option) => option.value === value) || {}).label);

    case 'day': {
      if (value.match('00/00/')) {
        return value.slice(6);
      } else {
        const validValue = moment(value.replace('00', '01'), 'MM/DD/YYYY');
        const month = validValue.format('MMMM');
        return `${translate(toPascalCase(month))}, ${validValue.format('YYYY')}`;
      }
    }
    case 'currency':
      return Number(value).toLocaleString('no', { style: 'currency', currency: component.currency || 'nok' });
    case 'bankAccount':
      const bankAccountRegex = /^(\d{4})(\d{2})(\d{5})$/;
      const [bankAccountMatch, ...bankAccountGroups] =
        (typeof value === 'string' && value?.match(bankAccountRegex)) || [];
      if (bankAccountMatch) {
        return bankAccountGroups.join(' ');
      }
      return value;
    case 'orgNr':
      const orgNrRegex = /^(\d{3})(\d{3})(\d{3})$/;
      const [orgNrMatch, ...orgNrGroups] = (typeof value === 'string' && value?.match(orgNrRegex)) || [];
      if (orgNrMatch) {
        return orgNrGroups.join(' ');
      }
      return value;
    case 'number':
      const prefix = component.prefix ? `${component.prefix} ` : '';
      const suffix = component.suffix ? ` ${component.suffix}` : '';
      return prefix + Number(value).toLocaleString('no', { maximumFractionDigits: 2 }) + suffix;
    case 'attachment':
      return {
        description: translate(TEXTS.statiske.attachment[value.key]),
        additionalDocumentationLabel: translate(
          component.attachmentValues?.[value.key]?.additionalDocumentation?.label,
        ),
        additionalDocumentation: translate(value.additionalDocumentation),
        deadlineWarning:
          !!component.attachmentValues?.[value.key]?.showDeadline && form?.properties?.ettersendelsesfrist
            ? translate(TEXTS.statiske.attachment.deadline, { deadline: form?.properties?.ettersendelsesfrist })
            : undefined,
      };
    case 'navAddress':
      const bostedsadresse = value.sokerAdresser?.bostedsadresse;
      const adresse = bostedsadresse?.adresse;
      const postnummer = bostedsadresse?.postnummer;
      const co = bostedsadresse?.co ? `c/o ${bostedsadresse.co}` : undefined;
      const postboks = bostedsadresse?.postboks;

      const addressComponents = [adresse, postnummer, postboks, co].filter(Boolean);
      const address = addressComponents.join(' ');

      return {
        address,
        linkText: translate(TEXTS.statiske.address.skatteetatenLink),
      };
    case 'drivinglist':
      return {
        description: translate(TEXTS.statiske.drivingList.summaryDescription),
        dates: value?.dates
          ?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((date) => {
            const formattedDate = dateUtils.toWeekdayAndDate(date.date, language);
            return {
              key: date.date,
              text: date.parking
                ? translate(TEXTS.statiske.drivingList.summaryTextParking, {
                    date: formattedDate,
                    parking: date.parking,
                  })
                : formattedDate,
            };
          }),
      };
    default:
      return value;
  }
}

function handlePanel(
  component,
  submission,
  formSummaryObject,
  parentContainerKey,
  translate,
  evaluatedConditionals,
  excludeEmptyPanels,
  form,
  language,
) {
  const { title, key, type, components = [] } = component;
  const subComponents = components.reduce(
    (subComponents, subComponent) =>
      handleComponent(
        subComponent,
        submission,
        subComponents,
        parentContainerKey,
        translate,
        evaluatedConditionals,
        excludeEmptyPanels,
        form,
        language,
      ),
    [],
  );
  if (subComponents.length === 0 && excludeEmptyPanels) {
    return [...formSummaryObject];
  }
  return [
    ...formSummaryObject,
    {
      label: translate(title),
      key,
      type,
      components: subComponents,
    },
  ];
}

function handleContainer(
  component,
  submission,
  formSummaryObject,
  parentContainerKey,
  translate,
  evaluatedConditionals,
  excludeEmptyPanels,
  form,
  language,
) {
  const { components, key } = component;
  const containerKey = createComponentKey(parentContainerKey, key);
  if (!components || components.length === 0) {
    return formSummaryObject;
  } else {
    const mappedSubComponents = components.reduce(
      (subComponents, subComponent) =>
        handleComponent(
          subComponent,
          submission,
          subComponents,
          containerKey,
          translate,
          evaluatedConditionals,
          excludeEmptyPanels,
          form,
          language,
        ),
      [],
    );
    return [...formSummaryObject, ...mappedSubComponents];
  }
}

function handleField(component, submission, formSummaryObject, parentContainerKey, translate, form, language) {
  const { key, label, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey);
  if (
    submissionValue === null ||
    submissionValue === undefined ||
    submissionValue === '' ||
    (type === 'landvelger' && Object.keys(submissionValue).length === 0) ||
    (type === 'valutavelger' && Object.keys(submissionValue).length === 0)
  ) {
    return formSummaryObject;
  }
  const hiddenInSummary = type === 'maalgruppe';
  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key: componentKey,
      type,
      ...(hiddenInSummary && { hiddenInSummary }),
      value: formatValue(component, submissionValue, translate, form, language),
    },
  ];
}

function handleDataGridRows(component, submission, translate, form, language) {
  const { key, rowTitle, components } = component;
  const dataGridSubmission = FormioUtils.getValue(submission, key) || [];
  return dataGridSubmission
    .map((rowSubmission, index) => {
      const dataGridRowComponents = components.reduce(
        (handledComponents, subComponent) =>
          handleComponent(
            subComponent,
            { data: rowSubmission },
            handledComponents,
            '',
            translate,
            {},
            true,
            form,
            language,
          ),
        [],
      );
      if (dataGridRowComponents.length > 0) {
        return {
          type: 'datagrid-row',
          label: translate(rowTitle),
          key: `${key}-row-${index}`,
          components: dataGridRowComponents,
        };
      }
    })
    .filter((row) => !!row);
}

function handleDataGrid(component, submission, formSummaryObject, parentContainerKey, translate, form, language) {
  const { label, key, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);

  const dataGridRows = handleDataGridRows(component, submission, translate, form, language);
  if (dataGridRows.length === 0) {
    return [...formSummaryObject];
  }

  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key: componentKey,
      type,
      components: dataGridRows,
    },
  ];
}

function handleFieldSet(
  component,
  submission,
  formSummaryObject,
  parentContainerKey,
  translate,
  evaluatedConditionals,
  excludeEmptyPanels,
  form,
  language,
) {
  const { legend, key, components, type } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  }
  const mappedSubComponents = components.reduce(
    (subComponents, subComponent) =>
      handleComponent(
        subComponent,
        submission,
        subComponents,
        parentContainerKey,
        translate,
        evaluatedConditionals,
        excludeEmptyPanels,
        form,
        language,
      ),
    [],
  );
  if (mappedSubComponents.length === 0) {
    return formSummaryObject;
  }
  return [
    ...formSummaryObject,
    {
      label: translate(legend),
      key,
      type,
      components: mappedSubComponents,
    },
  ];
}

function handleSelectboxes(component, submission, formSummaryObject, parentContainerKey, translate) {
  const { key, label, type, values } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey) || {};
  const value = values
    .filter((checkbox) => submissionValue[checkbox.value] === true)
    .map((checkbox) => translate(checkbox.label));
  if (Array.isArray(value) && value.length === 0) {
    return formSummaryObject;
  }
  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key,
      type,
      value,
    },
  ];
}

function handleCheckBox(component, submission, formSummaryObject, parentContainerKey, translate, form, language) {
  const { key, label, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey);

  if (!submissionValue) {
    return [...formSummaryObject];
  } else {
    return [
      ...formSummaryObject,
      {
        label: translate(label),
        key: componentKey,
        type,
        value: formatValue(component, submissionValue, translate, form, language),
      },
    ];
  }
}

function handleHtmlElement(component, formSummaryObject, parentContainerKey, translate, evaluatedConditionals) {
  const { key, contentForPdf, type, textDisplay, content } = component;

  if (shouldShowInSummary(createComponentKeyWithNavId(component), evaluatedConditionals)) {
    const componentKey = createComponentKey(parentContainerKey, key);
    if (textDisplay === 'formPdf' || textDisplay === 'pdf') {
      return [
        ...formSummaryObject,
        {
          key: componentKey,
          type,
          value: translate(content),
        },
      ];
    } else if (contentForPdf) {
      return [
        ...formSummaryObject,
        {
          label: translate(TEXTS.grensesnitt.formSummaryUtils.payAttentionTo),
          key: componentKey,
          type,
          value: translate(contentForPdf),
        },
      ];
    }
  }
  return formSummaryObject;
}

function handleImage(component, formSummaryObject, parentContainerKey, translate) {
  const { key, label, type, image, altText, widthPercent, showInPdf } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  if (image.length > 0 && image[0].url) {
    return [
      ...formSummaryObject,
      {
        label: translate(label),
        key: componentKey,
        type,
        value: image[0].url,
        alt: translate(altText),
        widthPercent,
        showInPdf,
      },
    ];
  }

  return [...formSummaryObject];
}

function handleAmountWithCurrencySelector(component, submission, formSummaryObject, parentContainerKey, translate) {
  if (!submission.data) {
    return formSummaryObject;
  }

  const { key, label, components } = component;
  const componentKey = createComponentKey(parentContainerKey, key);

  var componentWithType = (type) =>
    components.find((obj) => {
      return obj.type === type;
    });

  const numberKey = componentWithType('number')?.key;
  const valutaKey = componentWithType('valutavelger')?.key;

  const submissionValue = FormioUtils.getValue(submission, componentKey);

  const number = submissionValue?.[numberKey];

  if (!number) {
    return formSummaryObject;
  }

  const currency = submissionValue[valutaKey].value || 'nok';

  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key,
      type: 'currency',
      value: Number(number).toLocaleString('no', { style: 'currency', currency, currencyDisplay: 'code' }),
    },
  ];
}

function handleComponent(
  component,
  submission = { data: {} },
  formSummaryObject,
  parentContainerKey = '',
  translate,
  evaluatedConditionals = {},
  excludeEmptyPanels = true,
  form = {},
  language = 'nb-NO',
) {
  if (!shouldShowInSummary(createComponentKeyWithNavId(component), evaluatedConditionals)) {
    return formSummaryObject;
  }
  switch (component.type) {
    case 'panel':
      return handlePanel(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        evaluatedConditionals,
        excludeEmptyPanels,
        form,
        language,
      );
    case 'button':
    case 'content':
      return formSummaryObject;
    case 'htmlelement':
    case 'alertstripe':
      return handleHtmlElement(
        component,
        formSummaryObject,
        parentContainerKey,
        translate,
        evaluatedConditionals,
        language,
      );
    case 'container':
      return handleContainer(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        evaluatedConditionals,
        excludeEmptyPanels,
        form,
        language,
      );
    case 'datagrid':
      return handleDataGrid(component, submission, formSummaryObject, parentContainerKey, translate, form, language);
    case 'selectboxes':
      return handleSelectboxes(component, submission, formSummaryObject, parentContainerKey, translate);
    case 'navCheckbox':
      return handleCheckBox(component, submission, formSummaryObject, parentContainerKey, translate, form, language);
    case 'fieldset':
    case 'navSkjemagruppe':
      return handleFieldSet(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        evaluatedConditionals,
        excludeEmptyPanels,
        form,
        language,
      );
    case 'image':
      return handleImage(component, formSummaryObject, parentContainerKey, translate);
    case 'row':
      if (component.isAmountWithCurrencySelector) {
        return handleAmountWithCurrencySelector(
          component,
          submission,
          formSummaryObject,
          parentContainerKey,
          translate,
        );
      } else {
        return handleContainer(
          component,
          submission,
          formSummaryObject,
          parentContainerKey,
          translate,
          evaluatedConditionals,
          excludeEmptyPanels,
          form,
          language,
        );
      }
    default:
      return handleField(component, submission, formSummaryObject, parentContainerKey, translate, form, language);
  }
}

const shouldShowInSummary = (componentKey, evaluatedConditionals) => {
  return evaluatedConditionals[componentKey] === undefined || evaluatedConditionals[componentKey];
};

function evaluateConditionals(components = [], form, data, row = []) {
  return components
    .map((component) => {
      const clone = JSON.parse(JSON.stringify(component));
      clone.customConditional = sanitizeJavaScriptCode(clone.customConditional);
      return clone;
    })
    .flatMap((component) => {
      if (!FormioUtils.checkCondition(component, row, data, form)) {
        return [{ key: createComponentKeyWithNavId(component), value: false }];
      }
      switch (component.type) {
        case 'container':
          return evaluateConditionals(component.components, form, data, data[component.key]);
        case 'panel':
        case 'fieldset':
        case 'navSkjemagruppe':
          return evaluateConditionals(component.components, form, data);
        case 'htmlelement':
        case 'image':
        case 'alertstripe':
          return {
            key: createComponentKeyWithNavId(component),
            value: FormioUtils.checkCondition(component, row, data, form),
          };
        default:
          return [];
      }
    });
}

// A map of components (key-navId) with their conditional evaluation (used to determine if a component should be shown in the summary/PDF or not in shouldShowInSummary())
function mapAndEvaluateConditionals(form, data = {}) {
  return evaluateConditionals(form.components, form, data).reduce(addToMap, {});
}

function createFormSummaryObject(
  form,
  submission = { data: {} },
  translate = (txt) => txt,
  excludeEmptyPanels,
  language,
) {
  const evaluatedConditionalsMap = mapAndEvaluateConditionals(form, submission.data);
  return form.components.reduce(
    (formSummaryObject, component) =>
      handleComponent(
        component,
        submission,
        formSummaryObject,
        '',
        translate,
        evaluatedConditionalsMap,
        excludeEmptyPanels,
        form,
        language,
      ),
    [],
  );
}

function createFormSummaryPanels(form, submission, translate, excludeEmptyPanels, language) {
  return createFormSummaryObject(form, submission, translate, excludeEmptyPanels, language).filter(
    (component) => component.type === 'panel',
  );
}

const findFirstInput = (component) => {
  if (component?.input) {
    return component;
  }

  for (const subComponent of component?.components ?? []) {
    const firstInputInSubComponent = findFirstInput(subComponent);
    if (!!firstInputInSubComponent) {
      return firstInputInSubComponent;
    }
  }
  return undefined;
};

export default {
  createFormSummaryObject,
  createFormSummaryPanels,
  handleComponent,
  mapAndEvaluateConditionals,
  createComponentKeyWithNavId,
  findFirstInput,
};
