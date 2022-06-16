import { navFormUtils, signatureUtils } from "@navikt/skjemadigitalisering-shared-domain";
import FormioUtils from "formiojs/utils";

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
  if (props?.descriptionOfSignatures) {
    array.push({
      text: props.descriptionOfSignatures,
      type: getInputType(props.descriptionOfSignatures),
    });
  }
  if (props?.signatures) {
    signatureUtils.mapBackwardCompatibleSignatures(props.signatures).forEach((signature) => {
      if (signature.label !== "") {
        array.push({
          text: signature.label,
          type: getInputType(signature.label),
        });
      }

      if (signature.description !== "") {
        array.push({
          text: signature.description,
          type: getInputType(signature.description),
        });
      }
    });
  }
  return array;
};

const getContent = (content) => {
  if (content) {
    // Formio.js runs code that changes the original text before translating,
    // and to avoid mismatch in translation object keys we need to do the same.
    return FormioUtils.translateHTMLTemplate(content, (text) => text);
  }
  return content;
};

const getLabel = (label, type, hideLabel) => {
  const excludeLabelForType = [
    "panel",
    "htmlelement",
    "content",
    "fieldset",
    "navSkjemagruppe",
    "alertstripe",
    "image",
  ].includes(type);
  if (hideLabel || excludeLabelForType) return undefined;
  return label;
};

const getTranslatablePropertiesFromForm = (form) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.type !== "hidden")
    .map(
      ({
        content,
        title,
        label,
        hideLabel,
        html,
        type,
        values,
        legend,
        description,
        additionalDescriptionLabel,
        additionalDescriptionText,
        suffix,
        prefix,
        data,
        contentForPdf,
        altText,
      }) => ({
        title,
        label: getLabel(label, type, hideLabel),
        html,
        values: values ? values.map((value) => value.label) : undefined,
        content: getContent(content),
        legend,
        description: getTextFromComponentProperty(description),
        additionalDescriptionLabel: getTextFromComponentProperty(additionalDescriptionLabel),
        additionalDescriptionText: getTextFromComponentProperty(additionalDescriptionText),
        suffix: getTextFromComponentProperty(filterSpecialSuffix(suffix)),
        prefix: getTextFromComponentProperty(prefix),
        data: data ? data.values.map((value) => value.label) : undefined,
        contentForPdf: getTextFromComponentProperty(contentForPdf),
        altText: getTextFromComponentProperty(altText),
      })
    );

const withoutDuplicatedComponents = (component, index, currentComponents) =>
  index === currentComponents.findIndex((currentComponent) => currentComponent.text === component.text);

const textObject = (withInputType, value, removeLineBreak = false) => {
  if (withInputType)
    return {
      text: value,
      type: getInputType(value),
    };
  else {
    return removeLineBreak
      ? { text: removeLineBreaks(value) }
      : {
          text: value,
        };
  }
};

const removeLineBreaks = (text) => (text ? text.replace(/(\r\n|\n|\r)/gm, " ") : text);

const getFormTexts = (form, withInputType = false, removeLineBreak = false) => {
  if (!form) {
    return [];
  }
  const simplifiedComponentObject = getTranslatablePropertiesFromForm(form);
  simplifiedComponentObject.splice(0, 0, {
    title: form.title,
  });
  return simplifiedComponentObject
    .flatMap((component) =>
      Object.keys(component)
        .filter((key) => component[key] !== undefined)
        .flatMap((key) => {
          if (key === "values" || key === "data") {
            return component[key]
              .filter((value) => value !== "")
              .map((value) => textObject(withInputType, value, removeLineBreak));
          }
          return textObject(withInputType, component[key], removeLineBreak);
        })
    )
    .concat(extractTextsFromProperties(form.properties))
    .filter((component, index, currentComponents) => withoutDuplicatedComponents(component, index, currentComponents));
};

/**
 * @param translations translations object for a given language
 * @returns translations object for the language without line breaks
 */
const removeLineBreaksFromTranslations = (translations) => {
  return Object.keys(translations).reduce((previousTranslations, originalText) => {
    const originalTextWithoutLineBreaks = removeLineBreaks(originalText);
    const translationObject = translations[originalText];
    return {
      ...previousTranslations,
      [originalTextWithoutLineBreaks]: {
        ...translationObject,
        value: removeLineBreaks(translationObject.value),
      },
    };
  }, {});
};

const escapeQuote = (text) => {
  if (typeof text === "string" && text.includes("'")) {
    return text.replaceAll(/'/g, '"');
  }
  return text;
};

const getTextsAndTranslationsForForm = (form, translations) => {
  const textComponents = getFormTexts(form, false, true);
  let textsWithTranslations = [];
  Object.keys(translations).forEach((languageCode) => {
    const translationsForLanguage = removeLineBreaksFromTranslations(translations[languageCode].translations);
    textsWithTranslations = textComponents.reduce((newTextComponent, textComponent) => {
      if (Object.keys(translationsForLanguage).indexOf(textComponent.text) < 0) {
        return [...newTextComponent, { ...textComponent, text: escapeQuote(textComponent.text) }];
      } else {
        const translationObject = translationsForLanguage[textComponent.text];
        const translation =
          translationObject.scope === "global"
            ? translationObject.value.concat(" (Global Tekst)")
            : translationObject.value;
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
  getTextsAndTranslationsForForm,
  getTextsAndTranslationsHeaders,
  getInputType,
  withoutDuplicatedComponents,
  getFormTexts,
  removeLineBreaksFromTranslations,
};
