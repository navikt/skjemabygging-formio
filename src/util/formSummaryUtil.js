import TEXTS from "../texts";

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

function filterNonFormContent(components = [], submission = []) {
  return components.filter((component) => {
    switch (component.type) {
      case "content":
      case "htmlelement":
        return false;
      case "container":
        return filterNonFormContent(component.components, submission[component.key]).length > 0;
      case "fieldset":
      case "navSkjemagruppe":
        return filterNonFormContent(component.components, submission).length > 0;
      default:
        return submission[component.key] !== "" && submission[component.key] !== undefined;
    }
  });
}

function handlePanel(component, submission, formSummaryObject, translate) {
  const { title, key, type, components } = component;
  const subComponents = filterNonFormContent(components, submission).reduce(
    (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents, translate),
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

function handleContainer(component, submission, formSummaryObject, translate) {
  const { components, key } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  } else {
    const mappedSubComponents = components.reduce(
      (subComponents, subComponent) => handleComponent(subComponent, submission[key], subComponents, translate),
      []
    );
    return [...formSummaryObject, ...mappedSubComponents];
  }
}

function handleDataGridRows(component, dataGridSubmission = [], translate) {
  const { key, rowTitle, components } = component;
  return dataGridSubmission.reduce((handledRows, rowSubmission, index) => {
    const dataGridRowComponents = components.reduce(
      (handledComponents, subComponent) => handleComponent(subComponent, rowSubmission, handledComponents, translate),
      []
    );

    if (dataGridRowComponents.length === 0) {
      return handledRows;
    }
    return [
      ...handledRows,
      {
        type: "datagrid-row",
        label: translate(rowTitle),
        key: `${key}-row-${index}`,
        components: dataGridRowComponents,
      },
    ];
  }, []);
}

function handleDataGrid(component, submission, formSummaryObject, translate) {
  const { label, key, type } = component;

  const dataGridRows = handleDataGridRows(component, submission[key], translate);
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

function handleFieldSet(component, submission, formSummaryObject, translate) {
  const { legend, key, components, type } = component;
  if (!components || components.length === 0) {
    return formSummaryObject;
  }
  const mappedSubComponents = components.reduce(
    (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents, translate),
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

function handleField(component, submission, formSummaryObject, translate) {
  const { key, label, type } = component;
  if (submission[key] === undefined || submission[key] === "") {
    return formSummaryObject;
  }
  return [
    ...formSummaryObject,
    {
      label: translate(label),
      key,
      type,
      value: formatValue(component, submission[component.key], translate),
    },
  ];
}

export function handleComponent(component, submission = {}, formSummaryObject, translate = (text) => text) {
  switch (component.type) {
    case "panel":
      return handlePanel(component, submission, formSummaryObject, translate);
    case "button":
    case "content":
    case "htmlelement":
      return formSummaryObject;
    case "container":
      return handleContainer(component, submission, formSummaryObject, translate);
    case "datagrid":
      return handleDataGrid(component, submission, formSummaryObject, translate);
    case "fieldset":
    case "navSkjemagruppe":
      return handleFieldSet(component, submission, formSummaryObject, translate);
    default:
      return handleField(component, submission, formSummaryObject, translate);
  }
}

export function createFormSummaryObject(form, submission, translate = (text) => text) {
  const formSummaryObject = form.components.reduce(
    (formSummaryObject, component) => handleComponent(component, submission, formSummaryObject, translate),
    []
  );
  return formSummaryObject;
}
