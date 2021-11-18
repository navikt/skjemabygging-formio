import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";

const getInputType = (value) => {
  return value.length < 80 ? "text" : "textarea";
};

const filterSpecialSuffix = (suffix) => {
  const specialSuffixList = ["%", "km", "cm", "kg", "kr", "m"];
  return specialSuffixList.indexOf(suffix) >= 0 ? "" : suffix;
};

const getTextFromComponentProperty = (property) => (property !== "" ? property : undefined);

const extractTextsFromProperties = (props) => {
  const array = [];
  if (props?.innsendingOverskrift) {
    array.push({
      text: props.innsendingOverskrift,
      type: getInputType(props.innsendingOverskrift),
    });
  }
  if (props?.innsendingForklaring) {
    array.push({
      text: props.innsendingForklaring,
      type: getInputType(props.innsendingForklaring),
    });
  }
  if (props?.downloadPdfButtonText) {
    array.push({
      text: props.downloadPdfButtonText,
      type: getInputType(props.downloadPdfButtonText),
    });
  }
  if (props?.signatures) {
    Object.values(props.signatures).forEach((signature) => {
      if (signature !== "")
        array.push({
          text: signature,
          type: getInputType(signature),
        });
    });
  }
  return array;
};

const getSimplifiedComponentObject = (form) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter((component) => !component.hideLabel)
    .map(({ content, title, label, html, type, values, legend, description, suffix, prefix, data }) => ({
      title,
      label:
        ["panel", "htmlelement", "content", "fieldset", "navSkjemagruppe", "alertstripe"].indexOf(type) === -1
          ? label
          : undefined,
      html,
      values: values ? values.map((value) => value.label) : undefined,
      content: getTextFromComponentProperty(content),
      legend,
      description: getTextFromComponentProperty(description),
      suffix: getTextFromComponentProperty(filterSpecialSuffix(suffix)),
      prefix: getTextFromComponentProperty(prefix),
      data: data ? data.values.map((value) => value.label) : undefined,
    }));

const getComponentTextAndType = (textsForComponent, component, key) => {
  if (key === "values" || key === "data") {
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
  const textComponentsWithType = getSimplifiedComponentObject(form)
    .reduce((allTextsForForm, component) => {
      return [
        ...allTextsForForm,
        ...Object.keys(component)
          .filter((key) => component[key] !== undefined)
          .reduce((textsForComponent, key) => getComponentTextAndType(textsForComponent, component, key), []),
      ];
    }, [])
    .concat(extractTextsFromProperties(form.properties));
  return removeDuplicatedComponents(textComponentsWithType);
};

const parseText = (text) => {
  const pattern = /<a\s+(?:[^>]*?\s+)?href=\s?(["'])(.*?)\1/gm;
  if (text.match(pattern)) {
    text = text
      .replace(pattern, (match, p1, offset) => {
        return "(" + offset + ")";
      })
      .replace(/target=["']_blank["']/g, "");
  }
  return text.replace(/<\/?[^>]+(>|$)/gm, "").replace(/>(?=[^>]*)/gm, "");
};

const getAllTextsOrParsedTexts = (form, shouldParseText = true) => {
  const textComponents = getSimplifiedComponentObject(form)
    .reduce(
      (allTextsForForm, component) => {
        return [
          ...allTextsForForm,
          ...Object.keys(component)
            .filter((key) => component[key] !== undefined)
            .reduce((textsForComponent, key) => {
              if (key === "values" || key === "data") {
                return [
                  ...textsForComponent,
                  ...component[key].map((value) => ({
                    text: shouldParseText ? parseText(value) : value,
                  })),
                ];
              } else {
                return [...textsForComponent, { text: shouldParseText ? parseText(component[key]) : component[key] }];
              }
            }, []),
        ];
      },
      [{ text: form.title }]
    )
    .concat(extractTextsFromProperties(form.properties));
  return removeDuplicatedComponents(textComponents);
};

const getTextsAndTranslationsForForm = (form, translations) => {
  const textComponents = getAllTextsOrParsedTexts(form);
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
  getAllTextsOrParsedTexts,
  getTextsAndTypeForForm,
  getTextsAndTranslationsForForm,
  getTextsAndTranslationsHeaders,
  parseText,
  getInputType,
  removeDuplicatedComponents,
};
