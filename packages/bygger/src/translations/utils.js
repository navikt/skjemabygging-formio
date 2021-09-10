import { flattenComponents } from "@navikt/skjemadigitalisering-shared-components";

const getInputType = (value) => {
  return value.length < 80 ? "text" : "textarea";
};

const getTextFromComponentProperty = (property) => (property !== "" ? property : undefined);

const extractTextsFromProperties = props => {
  const array = [];
  if (props?.innsendingOverskrift) {
    array.push({
      text: props.innsendingOverskrift,
      type: getInputType(props.innsendingOverskrift)
    });
  }
  if (props?.innsendingForklaring) {
    array.push({
      text: props.innsendingForklaring,
      type: getInputType(props.innsendingForklaring)
    });
  }
  return array;
}

export const getAllTextsForForm = (form) =>
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
    }))
    .reduce((allTextsForForm, component) => {
      return [
        ...allTextsForForm,
        ...Object.keys(component)
          .filter((key) => component[key] !== undefined)
          .reduce((textsForComponent, key) => {
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
          }, []),
      ];
    }, [])
    .concat(extractTextsFromProperties(form.properties))
    //remove duplicated components
    .filter(
      (component, index, currentComponents) =>
        index === currentComponents.findIndex((currentComponent) => currentComponent.text === component.text)
    );
