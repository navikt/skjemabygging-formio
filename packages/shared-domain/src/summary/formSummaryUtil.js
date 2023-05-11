import FormioUtils from "formiojs/utils";
import moment from "moment";
import TEXTS from "../texts";
import sanitizeJavaScriptCode from "../utils/formio/sanitize-javascript-code";
import { addToMap } from "../utils/objectUtils";
import { toPascalCase } from "../utils/stringUtils";

require("moment/locale/nb.js");

function createComponentKey(parentContainerKey, key) {
  return parentContainerKey.length > 0 ? `${parentContainerKey}.${key}` : key;
}

function formatValue(component, value, translate) {
  switch (component.type) {
    case "radiopanel":
    case "radio":
      const valueObject = component.values.find(
        (valueObject) => String(valueObject.value).toString() === String(value).toString()
      );
      if (!valueObject) {
        console.log(`'${value}' is not in ${JSON.stringify(component.values)}`);
        return "";
      }
      return translate(valueObject.label);
    case "signature": {
      console.log("rendering signature not supported");
      return "";
    }
    case "navDatepicker": {
      if (!value) {
        return "";
      }
      const date = new Date(value);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`; // TODO: month is zero based.
    }
    case "navCheckbox": {
      return value ? translate(TEXTS.common.yes) : translate(TEXTS.common.no);
    }
    case "landvelger":
    case "valutavelger":
      // For å sikre bakoverkompatibilitet må vi ta høyde for at value kan være string
      return translate(typeof value === "string" ? value : value?.label);

    case "select":
    case "navSelect":
      if (typeof value === "object") {
        return translate(value.label);
      }
      return translate((component.data.values.find((option) => option.value === value) || {}).label);

    case "day": {
      if (value.match("00/00/")) {
        return value.slice(6);
      } else {
        const validValue = moment(value.replace("00", "01"), "MM/DD/YYYY");
        const month = validValue.format("MMMM");
        return `${translate(toPascalCase(month))}, ${validValue.format("YYYY")}`;
      }
    }
    case "currency":
      return Number(value).toLocaleString("no", { style: "currency", currency: component.currency || "nok" });
    case "number":
      const prefix = component.prefix ? `${component.prefix} ` : "";
      const suffix = component.suffix ? ` ${component.suffix}` : "";
      return prefix + Number(value).toLocaleString("no", { maximumFractionDigits: 2 }) + suffix;
    default:
      return value;
  }
}

function handlePanel(component, submission, formSummaryObject, parentContainerKey, translate, evaluatedConditionals) {
  const { title, key, type, components = [] } = component;
  const subComponents = components.reduce(
    (subComponents, subComponent) =>
      handleComponent(subComponent, submission, subComponents, parentContainerKey, translate, evaluatedConditionals),
    []
  );
  if (subComponents.length === 0) {
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

function handleContainer(component, submission, formSummaryObject, translate, evaluatedConditionals) {
  const { components, key } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  } else {
    const mappedSubComponents = components.reduce(
      (subComponents, subComponent) =>
        handleComponent(subComponent, submission, subComponents, key, translate, evaluatedConditionals),
      []
    );
    return [...formSummaryObject, ...mappedSubComponents];
  }
}

function handleField(component, submission, formSummaryObject, parentContainerKey, translate) {
  const { key, label, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey);
  if (
    submissionValue === null ||
    submissionValue === undefined ||
    submissionValue === "" ||
    (type === "landvelger" && Object.keys(submissionValue).length === 0) ||
    (type === "valutavelger" && Object.keys(submissionValue).length === 0)
  ) {
    return formSummaryObject;
  }
  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key: componentKey,
      type,
      value: formatValue(component, submissionValue, translate),
    },
  ];
}

function handleDataGridRows(component, submission, translate) {
  const { key, rowTitle, components } = component;
  const dataGridSubmission = FormioUtils.getValue(submission, key) || [];
  return dataGridSubmission.map((rowSubmission, index) => {
    const dataGridRowComponents = components.reduce(
      (handledComponents, subComponent) =>
        handleComponent(subComponent, { data: rowSubmission }, handledComponents, "", translate),
      []
    );
    return {
      type: "datagrid-row",
      label: translate(rowTitle),
      key: `${key}-row-${index}`,
      components: dataGridRowComponents,
    };
  });
}

function handleDataGrid(component, submission, formSummaryObject, translate) {
  const { label, key, type } = component;

  const dataGridRows = handleDataGridRows(component, submission, translate);
  if (dataGridRows.length === 0) {
    return [...formSummaryObject];
  }

  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key,
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
  evaluatedConditionals
) {
  const { legend, key, components, type } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  }
  const mappedSubComponents = components.reduce(
    (subComponents, subComponent) =>
      handleComponent(subComponent, submission, subComponents, parentContainerKey, translate, evaluatedConditionals),
    []
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

function handleCheckBox(component, submission, formSummaryObject, parentContainerKey, translate) {
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
        value: formatValue(component, submissionValue, translate),
      },
    ];
  }
}

function handleHtmlElement(component, formSummaryObject, parentContainerKey, translate, evaluatedConditionals) {
  const { key, contentForPdf, type } = component;

  if (shouldShowInSummary(key, evaluatedConditionals) && contentForPdf) {
    const componentKey = createComponentKey(parentContainerKey, key);
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
  const { key, label, components } = component;

  const componentKey = createComponentKey(parentContainerKey, key);

  var componentWithType = (type) =>
    components.find((obj) => {
      return obj.type === type;
    });

  const numberKey = componentWithType("number")?.key;
  const valutaKey = componentWithType("valutavelger")?.key;

  const submissionValue = FormioUtils.getValue(submission, componentKey);

  const number = submissionValue[numberKey];

  if (!number) {
    return formSummaryObject;
  }

  const currency = submissionValue[valutaKey].value || "nok";

  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key,
      type: "currency",
      value: Number(number).toLocaleString("no", { style: "currency", currency, currencyDisplay: "code" }),
    },
  ];
}

function handleComponent(
  component,
  submission = { data: {} },
  formSummaryObject,
  parentContainerKey = "",
  translate,
  evaluatedConditionals = {}
) {
  if (!shouldShowInSummary(component.key, evaluatedConditionals)) {
    return formSummaryObject;
  }
  switch (component.type) {
    case "panel":
      return handlePanel(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        evaluatedConditionals
      );
    case "button":
    case "content":
      return formSummaryObject;
    case "htmlelement":
    case "alertstripe":
      return handleHtmlElement(component, formSummaryObject, parentContainerKey, translate, evaluatedConditionals);
    case "container":
      return handleContainer(component, submission, formSummaryObject, translate, evaluatedConditionals);
    case "datagrid":
      return handleDataGrid(component, submission, formSummaryObject, translate);
    case "selectboxes":
      return handleSelectboxes(component, submission, formSummaryObject, parentContainerKey, translate);
    case "navCheckbox":
      return handleCheckBox(component, submission, formSummaryObject, parentContainerKey, translate);
    case "fieldset":
    case "navSkjemagruppe":
      return handleFieldSet(
        component,
        submission,
        formSummaryObject,
        parentContainerKey,
        translate,
        evaluatedConditionals
      );
    case "image":
      return handleImage(component, formSummaryObject, parentContainerKey, translate);
    case "row":
      if (component.isAmountWithCurrencySelector) {
        return handleAmountWithCurrencySelector(
          component,
          submission,
          formSummaryObject,
          parentContainerKey,
          translate
        );
      } else {
        return handleContainer(component, submission, formSummaryObject, translate);
      }
    default:
      return handleField(component, submission, formSummaryObject, parentContainerKey, translate);
  }
}

const shouldShowInSummary = (componentKey, evaluatedConditionals) =>
  evaluatedConditionals[componentKey] === undefined || evaluatedConditionals[componentKey];

function evaluateConditionals(components = [], form, data, row = []) {
  return components
    .map((component) => {
      const clone = JSON.parse(JSON.stringify(component));
      clone.customConditional = sanitizeJavaScriptCode(clone.customConditional);
      return clone;
    })
    .flatMap((component) => {
      if (!FormioUtils.checkCondition(component, row, data, form)) {
        return [{ key: component.key, value: false }];
      }
      switch (component.type) {
        case "container":
          return evaluateConditionals(component.components, form, data, data[component.key]);
        case "panel":
        case "fieldset":
        case "navSkjemagruppe":
          return evaluateConditionals(component.components, form, data);
        case "htmlelement":
        case "image":
        case "alertstripe":
          return { key: component.key, value: FormioUtils.checkCondition(component, row, data, form) };
        default:
          return [];
      }
    });
}

function mapAndEvaluateConditionals(form, data = {}) {
  return evaluateConditionals(form.components, form, data).reduce(addToMap, {});
}

function createFormSummaryObject(form, submission, translate = (txt) => txt) {
  const evaluatedConditionalsMap = mapAndEvaluateConditionals(form, submission.data);
  return form.components.reduce(
    (formSummaryObject, component) =>
      handleComponent(component, submission, formSummaryObject, "", translate, evaluatedConditionalsMap),
    []
  );
}

function createFormSummaryPanels(form, submission, translate) {
  return createFormSummaryObject(form, submission, translate).filter((component) => component.type === "panel");
}

export default {
  createFormSummaryObject,
  createFormSummaryPanels,
  handleComponent,
  mapAndEvaluateConditionals,
};
