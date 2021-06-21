import { flattenComponents } from "../util/forsteside";

const getInputType = (value) => {
  return value.length < 80 ? "text" : "textarea";
};

export const getAllTextsForForm = (form) =>
  flattenComponents(form.components)
    .filter((component) => !component.hideLabel)
    .map(({ content, title, label, html, type, values, legend, description, suffix }) => ({
      title,
      label:
        ["panel", "htmlelement", "content", "fieldset", "navSkjemagruppe"].indexOf(type) === -1 ? label : undefined,
      html,
      values: values ? values.map((value) => value.label) : undefined,
      content,
      legend,
      description: description !== "" ? description : undefined,
      suffix: suffix !== "" ? suffix : undefined,
    }))
    .reduce((allTextsForForm, component) => {
      console.log("component", component);
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
    //remove duplicated components
    .filter(
      (component, index, currentComponents) =>
        index === currentComponents.findIndex((currentComponent) => currentComponent.text === component.text)
    );
