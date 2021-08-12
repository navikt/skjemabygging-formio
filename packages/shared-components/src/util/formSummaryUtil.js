import FormioUtils from "formiojs/utils";
import TEXTS from "../texts";

function createComponentKey(parentContainerKey, key) {
  return parentContainerKey.length > 0 ? `${parentContainerKey}.${key}` : key;
}
function formatValue(component, value, translate) {
  switch (component.type) {
    case "radiopanel":
    case "radio":
      const valueObject = component.values.find((valueObject) => valueObject.value === value);
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
      return value === "ja" ? translate(TEXTS.yes) : translate(TEXTS.no);
    }
    default:
      return value;
  }
}

function handlePanel(component, submission, formSummaryObject, parentContainerKey, translate, conditionalMap) {
  const { title, key, type, components = [] } = component;
  const subComponents = components.reduce(
    (subComponents, subComponent) =>
      handleComponent(subComponent, submission, subComponents, parentContainerKey, translate, conditionalMap),
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

function handleContainer(component, submission, formSummaryObject, translate, conditionalMap) {
  const { components, key } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  } else {
    const mappedSubComponents = components.reduce(
      (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents, key, translate, conditionalMap),
      []
    );
    return [...formSummaryObject, ...mappedSubComponents];
  }
}

function handleDataGridRows(component, submission, translate) {
  const { key, rowTitle, components } = component;
  const dataGridSubmission = FormioUtils.getValue(submission, key) || [];
  return dataGridSubmission.map((rowSubmission, index) => {
    const dataGridRowComponents = components
      .filter((component) => Object.keys(rowSubmission).indexOf(component.key) >= 0)
      .reduce(
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

function handleFieldSet(component, submission, formSummaryObject, parentContainerKey, translate) {
  const { legend, key, components, type } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  }
  const mappedSubComponents = components.reduce(
    (subComponents, subComponent) =>
      handleComponent(subComponent, submission, subComponents, parentContainerKey, translate),
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
  const submissionValue = FormioUtils.getValue(submission, componentKey);
  const value = values.filter((checkbox) => submissionValue[checkbox.value] === true).map((checkbox) => checkbox.label);
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

function handleHtmlElement(component, formSummaryObject, parentContainerKey, conditionalMap) {
  const { key, contentForPdf, type } = component;
  if (shouldShowInSummary(key, conditionalMap) && contentForPdf) {
    const componentKey = createComponentKey(parentContainerKey, key);
    return [
      ...formSummaryObject,
      {
        label: "Vær oppmerksom på",
        key: componentKey,
        type,
        value: contentForPdf,
      },
    ];
  }
  return formSummaryObject;
}

function handleField(component, submission, formSummaryObject, parentContainerKey, translate) {
  const { key, label, type } = component;
  const componentKey = createComponentKey(parentContainerKey, key);
  const submissionValue = FormioUtils.getValue(submission, componentKey);
  if (submissionValue === null || submissionValue === undefined || submissionValue === "") {
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

export function handleComponent(
  component,
  submission = { data: {} },
  formSummaryObject,
  parentContainerKey = "",
  translate,
  conditionalMap = {}
) {
  switch (component.type) {
    case "panel":
      return handlePanel(component, submission, formSummaryObject, parentContainerKey, translate, conditionalMap);
    case "button":
    case "content":
      return formSummaryObject;
    case "htmlelement":
    case "alertstripe":
      return handleHtmlElement(component, formSummaryObject, parentContainerKey, conditionalMap);
    case "container":
      return handleContainer(component, submission, formSummaryObject, translate, conditionalMap);
    case "datagrid":
      return handleDataGrid(component, submission, formSummaryObject, translate);
    case "selectboxes":
      return handleSelectboxes(component, submission, formSummaryObject, parentContainerKey, translate);
    case "fieldset":
    case "navSkjemagruppe":
      return handleFieldSet(component, submission, formSummaryObject, parentContainerKey, translate, conditionalMap);
    default:
      return handleField(component, submission, formSummaryObject, parentContainerKey, translate);
  }
}

const shouldShowInSummary = (componentKey, conditionalMap) =>
  conditionalMap[componentKey] === undefined || conditionalMap[componentKey];

const evaluateConditionals = (components, form, data, row = []) =>
  components.flatMap((component) => {
    switch (component.type) {
      case "container":
        return evaluateConditionals(component.components, form, data, data[component.key]);
      case "panel":
      case "fieldset":
      case "navSkjemagruppe":
        return evaluateConditionals(component.components, form, data);
      case "htmlelement":
      case "alertstripe":
        return {key: component.key, show: FormioUtils.checkCondition(component, row, data, form)};
      default:
        return [];
    }
  });

const mapEvaluatedConditionals = (form, data = []) =>
  evaluateConditionals(form.components, form, data)
    .reduce((map, {key, show}) => {
      if (key) {
        map[key] = show;
      }
      return map;
    }, {});



export function createFormSummaryObject(form, submission, translate) {
  const conditionalMap = mapEvaluatedConditionals(form, submission.data)
  return form.components.reduce(
    (formSummaryObject, component) => handleComponent(component, submission, formSummaryObject, "", translate, conditionalMap),
    []
  );
}
