import utils from "formiojs/utils";

function formatValue(component, value) {
  switch (component.type) {
    case "radiopanel":
    case "radio":
      const valueObject = component.values.find((valueObject) => valueObject.value === value);
      if (!valueObject) {
        console.log(`'${value}' is not in ${JSON.stringify(component.values)}`);
        return "";
      }
      return valueObject.label;
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
      return value === "ja" ? "Ja" : "Nei";
    }
    default:
      return value;
  }
}

function handlePanel(component, submission, formSummaryObject) {
  const { title, key, type, components = [] } = component;
  const subComponents = components.reduce(
    (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents),
    []
  );
  if (subComponents.length === 0) {
    return [...formSummaryObject];
  }
  return [
    ...formSummaryObject,
    {
      label: title,
      key,
      type,
      components: subComponents,
    },
  ];
}

function handleContainer(component, submission, formSummaryObject) {
  const { components, key } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  } else {
    const mappedSubComponents = components.reduce(
      (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents),
      []
    );
    return [...formSummaryObject, ...mappedSubComponents];
  }
}

function handleDataGridRows(component, submission) {
  const { key, rowTitle, components } = component;
  const dataGridSubmission = utils.getValue(submission, key) || [];
  return dataGridSubmission.map((rowSubmission, index) => {
    const dataGridRowComponents = components
      .filter((component) => Object.keys(rowSubmission).indexOf(component.key) >= 0)
      .reduce(
        (handledComponents, subComponent) => handleComponent(subComponent, { data: rowSubmission }, handledComponents),
        []
      );
    return {
      type: "datagrid-row",
      label: rowTitle,
      key: `${key}-row-${index}`,
      components: dataGridRowComponents,
    };
  });
}

function handleDataGrid(component, submission, formSummaryObject) {
  const { label, key, type } = component;

  const dataGridRows = handleDataGridRows(component, submission);
  if (dataGridRows.length === 0) {
    return [...formSummaryObject];
  }

  return [
    ...formSummaryObject,
    {
      label,
      key,
      type,
      components: dataGridRows,
    },
  ];
}

function handleFieldSet(component, submission, formSummaryObject) {
  const { legend, key, components, type } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  }
  const mappedSubComponents = components.reduce(
    (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents),
    []
  );
  if (mappedSubComponents.length === 0) {
    return formSummaryObject;
  }
  return [
    ...formSummaryObject,
    {
      label: legend,
      key,
      type,
      components: mappedSubComponents,
    },
  ];
}

function handleField(component, submission, formSummaryObject) {
  const { key, label, type } = component;
  const submissionValue = utils.getValue(submission, key);
  if (submissionValue === null || submissionValue === undefined || submissionValue === "") {
    return formSummaryObject;
  }
  return [
    ...formSummaryObject,
    {
      label,
      key,
      type,
      value: formatValue(component, submissionValue),
    },
  ];
}

export function handleComponent(component, submission = { data: {} }, formSummaryObject) {
  switch (component.type) {
    case "panel":
      return handlePanel(component, submission, formSummaryObject);
    case "button":
    case "content":
    case "htmlelement":
      return formSummaryObject;
    case "container":
      return handleContainer(component, submission, formSummaryObject);
    case "datagrid":
      return handleDataGrid(component, submission, formSummaryObject);
    case "fieldset":
    case "navSkjemagruppe":
      return handleFieldSet(component, submission, formSummaryObject);
    default:
      return handleField(component, submission, formSummaryObject);
  }
}

export function createFormSummaryObject(form, submission) {
  return form.components.reduce(
    (formSummaryObject, component) => handleComponent(component, submission, formSummaryObject),
    []
  );
}
