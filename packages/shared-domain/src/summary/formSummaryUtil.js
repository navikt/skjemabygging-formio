import moment from 'moment';
import 'moment/locale/nb';
import attachmentUtils from '../attachment';
import { formatPhoneNumber, numberUtils } from '../index';
import TEXTS from '../texts';
import currencyUtils from '../utils/currencyUtils';
import { dataFetcher } from '../utils/data-fetcher/DataFetcherUtils';
import dateUtils from '../utils/date';
import { bankAccountRegex, formatIBAN, formatNationalIdentityNumber, orgNrRegex } from '../utils/format-utils';
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

function formatPostnummerOgBySted(address) {
  if (address?.postnummer) {
    return address.bySted ? `${address?.postnummer} ${address?.bySted}` : address.postnummer;
  }
  return address?.bySted;
}

function formatValue(component, value, translate, form, language, opts = {}) {
  switch (component.type) {
    case 'radiopanel':
    case 'radio': {
      const valueObject = component.values?.find(
        (valueObject) => String(valueObject.value).toString() === String(value).toString(),
      );
      if (!valueObject) {
        console.log(`'${value}' is not in ${JSON.stringify(component.values)}`);
        return '';
      }
      return translate(valueObject.label);
    }
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
      return currencyUtils.toLocaleString(value, {
        currency: component.currency,
        integer: component.inputType === 'numeric',
      });
    case 'bankAccount': {
      const [bankAccountMatch, ...bankAccountGroups] =
        (typeof value === 'string' && value?.match(bankAccountRegex)) || [];
      if (bankAccountMatch) {
        return bankAccountGroups.join(' ');
      }
      return value;
    }
    case 'iban': {
      return formatIBAN(value);
    }
    case 'orgNr': {
      const [orgNrMatch, ...orgNrGroups] = (typeof value === 'string' && value?.match(orgNrRegex)) || [];
      if (orgNrMatch) {
        return orgNrGroups.join(' ');
      }
      return value;
    }
    case 'fnrfield': {
      return opts.skipPdfFormatting ? value : formatNationalIdentityNumber(value);
    }
    case 'number': {
      const prefix = component.prefix ? `${component.prefix} ` : '';
      const suffix = component.suffix ? ` ${component.suffix}` : '';
      return prefix + numberUtils.toLocaleString(value) + suffix;
    }
    case 'attachment':
      return attachmentUtils.mapToAttachmentSummary({ translate, value, component, form });
    case 'navAddress': {
      const addressComponents = [
        value?.co ? `c/o ${value.co}` : undefined,
        value?.adresse,
        value?.bygning,
        value?.postboks,
        formatPostnummerOgBySted(value),
        value?.region,
        value?.land?.label,
      ].filter(Boolean);
      return addressComponents.join(', ');
    }
    case 'identity': {
      return value?.identitetsnummer ? value?.identitetsnummer : dateUtils.toLocaleDate(value?.fodselsdato);
    }
    case 'addressValidity': {
      return {
        validFrom: value?.gyldigFraOgMed ? dateUtils.toLocaleDate(value?.gyldigFraOgMed) : undefined,
        validTo: value?.gyldigTilOgMed ? dateUtils.toLocaleDate(value?.gyldigTilOgMed) : undefined,
      };
    }
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
    case 'monthPicker':
      return toPascalCase(dateUtils.toLongMonthFormat(value, language));
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
  opts = {},
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
        opts,
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
  opts = {},
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
          opts,
        ),
      [],
    );
    return [...formSummaryObject, ...mappedSubComponents];
  }
}

function handleField(
  component,
  submission,
  formSummaryObject,
  parentContainerKey,
  translate,
  form,
  language,
  opts = {},
) {
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
      value: formatValue(component, submissionValue, translate, form, language, opts),
    },
  ];
}

function handleDataGridRows(component, submission, translate, form, language, opts) {
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
            opts,
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

function handleDataGrid(component, submission, formSummaryObject, parentContainerKey, translate, form, language, opts) {
  const { label, key, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);

  const dataGridRows = handleDataGridRows(component, submission, translate, form, language, opts);
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
  opts,
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
        opts,
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

const handleDataFetcher = (component, submission, formSummaryObject, parentContainerKey, translate) => {
  const { key, label, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const fetcher = dataFetcher(componentKey, submission);
  if (!fetcher.success) {
    return formSummaryObject;
  }
  const selected = fetcher.getAllSelected().map((item) => item.label);
  if (selected.length === 0) {
    return formSummaryObject;
  }

  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key: componentKey,
      type,
      value: selected,
    },
  ];
};

const handlePhoneNumber = (component, submission, formSummaryObject, parentContainerKey, translate, opts) => {
  const { key, label, type, showAreaCode } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey) || {};
  if (
    !submissionValue ||
    (typeof submissionValue === 'object' && Object.keys(submissionValue).length === 0) ||
    submissionValue === ''
  ) {
    return [...formSummaryObject];
  }
  if (showAreaCode && submissionValue.areaCode && submissionValue.number) {
    return [
      ...formSummaryObject,
      {
        label: translate(label),
        key: componentKey,
        type,
        value: opts.skipPdfFormatting
          ? `${submissionValue.areaCode} ${submissionValue.number}`
          : `${submissionValue.areaCode} ${formatPhoneNumber(submissionValue.number, submissionValue.areaCode)}`,
      },
    ];
  }

  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key: componentKey,
      type,
      value: submissionValue,
    },
  ];
};

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
      key: componentKey,
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

function handleIdentity(
  component,
  submission,
  formSummaryObject,
  parentContainerKey,
  translate,
  form,
  language,
  opts = {},
) {
  const { key, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey);

  if (!submissionValue || (!submissionValue.identitetsnummer && !submissionValue.fodselsdato)) {
    return [...formSummaryObject];
  }

  return [
    ...formSummaryObject,
    {
      label: submissionValue?.identitetsnummer
        ? translate(TEXTS.statiske.identity.identityNumber)
        : translate(TEXTS.statiske.identity.yourBirthdate),
      key: componentKey,
      type,
      value: formatValue(component, submissionValue, translate, form, language, opts),
    },
  ];
}

function handleAddressValidity(
  component,
  submission,
  formSummaryObject,
  parentContainerKey,
  translate,
  form,
  language,
) {
  const { key, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey);

  if (!submissionValue || (!submissionValue.gyldigFraOgMed && !submissionValue.gyldigFraOgMed)) {
    return [...formSummaryObject];
  }

  const formattedValue = formatValue(component, submissionValue, translate, form, language);

  const returnValues = [
    ...formSummaryObject,
    {
      label: translate(TEXTS.statiske.address.validFrom),
      key: `${componentKey}-from`,
      type,
      value: formattedValue.validFrom,
    },
  ];

  if (formattedValue.validTo) {
    returnValues.push({
      label: translate(TEXTS.statiske.address.validTo),
      key: `${componentKey}-to`,
      type,
      value: formattedValue.validTo,
    });
  }

  return returnValues;
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

  const numberComponent = componentWithType('number');
  const currencyComponent = componentWithType('valutavelger');

  if (!numberComponent || !currencyComponent) {
    return formSummaryObject;
  }

  const submissionValue = FormioUtils.getValue(submission, componentKey);

  const number = submissionValue?.[numberComponent.key];

  if (!number) {
    return formSummaryObject;
  }

  const currency = submissionValue[currencyComponent.key].value;

  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key,
      type: 'currency',
      value: currencyUtils.toLocaleString(number, {
        iso: true,
        currency,
        integer: numberComponent.inputType === 'numeric',
      }),
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
  opts = {},
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
        opts,
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
        opts,
      );
    case 'datagrid':
      return handleDataGrid(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        form,
        language,
        opts,
      );
    case 'dataFetcher':
      return handleDataFetcher(component, submission, formSummaryObject, parentContainerKey, translate);
    case 'phoneNumber':
      return handlePhoneNumber(component, submission, formSummaryObject, parentContainerKey, translate, opts);
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
        opts,
      );
    case 'image':
      return formSummaryObject;
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
          opts,
        );
      }
    case 'identity':
      return handleIdentity(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        form,
        language,
        opts,
      );
    case 'addressValidity':
      return handleAddressValidity(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        form,
        language,
      );
    default:
      return handleField(component, submission, formSummaryObject, parentContainerKey, translate, form, language, opts);
  }
}

const shouldShowInSummary = (componentKey, evaluatedConditionals) => {
  return evaluatedConditionals[componentKey] === undefined || evaluatedConditionals[componentKey];
};

function evaluateConditionals(components = [], form, submission, row = []) {
  return components
    .map((component) => {
      const clone = JSON.parse(JSON.stringify(component));
      clone.customConditional = sanitizeJavaScriptCode(clone.customConditional);
      return clone;
    })
    .flatMap((component) => {
      const data = submission?.data || {};
      if (!FormioUtils.checkCondition(component, row, data, form, undefined, submission)) {
        return [{ key: createComponentKeyWithNavId(component), value: false }];
      }
      switch (component.type) {
        case 'container':
          return evaluateConditionals(component.components, form, submission, data[component.key]);
        case 'panel':
        case 'fieldset':
        case 'navSkjemagruppe':
          return evaluateConditionals(component.components, form, submission);
        case 'htmlelement':
        case 'image':
        case 'alertstripe':
          return {
            key: createComponentKeyWithNavId(component),
            value: FormioUtils.checkCondition(component, row, data, form, undefined, submission),
          };
        default:
          return [];
      }
    });
}

// A map of components (key-navId) with their conditional evaluation (used to determine if a component should be shown in the summary/PDF or not in shouldShowInSummary())
function mapAndEvaluateConditionals(form, submission = { data: {} }) {
  return evaluateConditionals(form.components, form, submission).reduce(addToMap, {});
}

function createFormSummaryObject(
  form,
  submission = { data: {} },
  translate = (txt) => txt,
  excludeEmptyPanels,
  language,
  opts = {},
) {
  const evaluatedConditionalsMap = mapAndEvaluateConditionals(form, submission);
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
        opts,
      ),
    [],
  );
}

function createFormSummaryPanels(form, submission, translate, excludeEmptyPanels, language, opts = {}) {
  return createFormSummaryObject(form, submission, translate, excludeEmptyPanels, language, opts).filter(
    (component) => component.type === 'panel',
  );
}

const findFirstInput = (component) => {
  if (component?.input) {
    return component;
  }

  for (const subComponent of component?.components ?? []) {
    const firstInputInSubComponent = findFirstInput(subComponent);
    if (firstInputInSubComponent) {
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
