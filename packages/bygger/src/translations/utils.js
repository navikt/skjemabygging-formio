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

const getComponentTextAndType = (textsForComponent, component, key) => {
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

const getTextsAndTypeForForm = (form) => {
  const textComponentsWithType = getSimplifiedComponentObject(form).reduce((allTextsForForm, component) => {
    return [
      ...allTextsForForm,
      ...Object.keys(component)
        .filter((key) => component[key] !== undefined)
        .reduce((textsForComponent, key) => getComponentTextAndType(textsForComponent, component, key), []),
    ];
  }, []);

  return removeDuplicatedComponents(textComponentsWithType);
};

const parseText = (text) => {
  const pattern = /<a\s+(?:[^>]*?\s+)?href=\s?(["'])(.*?)\1/gm;
  if (text.match(pattern)) {
    text = text
      .replace(pattern, (match, p1, offset) => {
        return "(" + offset + ")";
      })
      .replace(/target="_blank"/g, "");
  }
  return text.replace(/<\/?[^>]+(>|$)/gm, "").replace(/>(?=[^>]*)/gm, "");
};

const getAllParsedTexts = (form) => {
  const textComponents = getSimplifiedComponentObject(form).reduce(
    (allTextsForForm, component) => {
      return [
        ...allTextsForForm,
        ...Object.keys(component)
          .filter((key) => component[key] !== undefined)
          .reduce((textsForComponent, key) => {
            if (key === "values") {
              return [
                ...textsForComponent,
                ...component[key].map((value) => ({
                  text: parseText(value),
                })),
              ];
            } else {
              return [...textsForComponent, { text: parseText(component[key]) }];
            }
          }, []),
      ];
    },
    [{ text: form.title }]
  );
  return removeDuplicatedComponents(textComponents);
};
const getTextsAndTranslationsForForm = (form, translations) => {
  const textComponents = getAllParsedTexts(form);
  let textsWithTranslations = [];
  Object.keys(translations).forEach((languageCode) => {
    textsWithTranslations = textComponents.reduce((newTextComponent, textComponent) => {
      if (Object.keys(translations[languageCode].translations).indexOf(textComponent.text) < 0) {
        return [...newTextComponent, textComponent];
      } else {
        const translation =
          translations[languageCode].translations[textComponent.text].scope === "global"
            ? translations[languageCode].translations[textComponent.text].value.concat(" (Global Tekst)")
            : translations[languageCode].translations[textComponent.text].value;
        return [
          ...newTextComponent,
          Object.assign(textComponent, {
            [languageCode]: translation,
          }),
        ];
      }
    }, []);
  });
  return textsWithTranslations;
};

const getTextsAndTranslationsHeaders = (translations) => {
  return Object.keys(translations).reduce(
    (headers, languageCode) => {
      return [
        ...headers,
        {
          label: languageCode.toUpperCase(),
          key: languageCode,
        },
      ];
    },
    [{ label: "Skjematekster", key: "text" }]
  );
};

export {
  getAllParsedTexts,
  getTextsAndTypeForForm,
  getTextsAndTranslationsForForm,
  getTextsAndTranslationsHeaders,
  parseText,
};
