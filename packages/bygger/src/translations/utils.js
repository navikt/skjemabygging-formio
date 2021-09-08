import { flattenComponents } from "@navikt/skjemadigitalisering-shared-components";

const getInputType = (value) => {
  return value.length < 80 ? "text" : "textarea";
};

const getTextFromComponentProperty = (property) => (property !== "" ? property : undefined);

const getSimplifiedComponentObject = (form) =>
  flattenComponents(form.components)
    .filter((component) => !component.hideLabel)
    .map(({ content, title, label, html, type, values, legend, description, suffix, prefix }) => ({
      title,
      label:
        ["panel", "htmlelement", "content", "fieldset", "navSkjemagruppe"].indexOf(type) === -1 ? label : undefined,
      html,
      values: values ? values.map((value) => value.label) : undefined,
      content,
      legend,
      description: getTextFromComponentProperty(description),
      suffix: getTextFromComponentProperty(suffix),
      prefix: getTextFromComponentProperty(prefix),
    }));

const getComponentText = (textsForComponent, component, key) => {
  if (key === "values") {
    return [
      ...textsForComponent,
      ...component[key].map((value) => ({
        text: value,
        type: getInputType(value),
      })),
    ];
  } else {
    return [...textsForComponent, { text: component[key], type: getInputType(component[key]) }];
  }
};

const removeDuplicatedComponents = (components = []) => {
  return components.filter(
    (component, index, currentComponents) =>
      index === currentComponents.findIndex((currentComponent) => currentComponent.text === component.text)
  );
};

const getAllTexts = (form) => {
  const textComponents = getSimplifiedComponentObject(form).reduce((allTextsForForm, component) => {
    return [
      ...allTextsForForm,
      ...Object.keys(component)
        .filter((key) => component[key] !== undefined)
        .reduce((textsForComponent, key) => {
          if (key === "values") {
            return [
              ...textsForComponent,
              ...component[key].map((value) => ({
                text: value.replace(/<\/?[^>]+(>|$)/gm, ""),
              })),
            ];
          } else {
            return [...textsForComponent, { text: component[key].replace(/<\/?[^>]+(>|$)/gm, "") }];
          }
        }, []),
    ];
  }, []);
  return removeDuplicatedComponents(textComponents);
};

const getAllTextsAndTypeForForm = (form) => {
  const textComponentsWithType = getSimplifiedComponentObject(form).reduce((allTextsForForm, component) => {
    return [
      ...allTextsForForm,
      ...Object.keys(component)
        .filter((key) => component[key] !== undefined)
        .reduce((textsForComponent, key) => getComponentText(textsForComponent, component, key), []),
    ];
  }, []);
  return removeDuplicatedComponents(textComponentsWithType);
};

export { getAllTexts, getAllTextsAndTypeForForm };
