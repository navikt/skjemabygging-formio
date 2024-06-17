import {
  HtmlAsJsonElement,
  HtmlAsJsonTextElement,
  htmlConverter,
  NavFormioJs,
  StructuredHtmlElement,
} from '@navikt/skjemadigitalisering-shared-components';

import {
  AccordionSettingValue,
  AccordionSettingValues,
  AttachmentSettingValue,
  AttachmentSettingValues,
  Component,
  FormioTranslationMap,
  Language,
  NavFormType,
  navFormUtils,
  signatureUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';

type TextObjectType = { text: string; type?: InputType };
type InputType = 'text' | 'textarea';
type CsvRow = {
  type: 'tekst' | 'html';
  order: string;
  text: string;
} & {
  [key in Language]?: string;
};

const getInputType = (value: string): InputType => {
  return value?.length < 80 ? 'text' : 'textarea';
};

const getTextFromComponentProperty = (property: string | undefined) => (property !== '' ? property : undefined);

const extractTextsFromProperties = (props: NavFormType['properties']): TextObjectType[] => {
  const array: { text: string; type: InputType }[] = [];
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
  if (props?.declarationText) {
    array.push({
      text: props.declarationText,
      type: getInputType(props.declarationText),
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
      if (signature.label) {
        array.push({
          text: signature.label,
          type: getInputType(signature.label),
        });
      }

      if (signature.description) {
        array.push({
          text: signature.description,
          type: getInputType(signature.description),
        });
      }
    });
  }
  return array;
};

const getContent = (content: string | undefined): string | undefined => {
  if (content) {
    // Formio.js runs code that changes the original text before translating,
    // and to avoid mismatch in translation object keys we need to do the same.
    // @ts-ignore
    return NavFormioJs.Utils.translateHTMLTemplate(content, (text) => text);
  }
  return content;
};

const getLabel = (label: string, type: string, hideLabel: boolean) => {
  const excludeLabelForType = [
    'panel',
    'htmlelement',
    'content',
    'fieldset',
    'navSkjemagruppe',
    'alertstripe',
    'image',
  ].includes(type);
  if (hideLabel || excludeLabelForType) return undefined;
  return label;
};

const getTranslatablePropertiesFromForm = (form: NavFormType) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.type !== 'hidden')
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
        data,
        contentForPdf,
        altText,
        buttonText,
        addAnother,
        removeAnother,
        attachmentValues,
        accordionValues,
      }) => ({
        title,
        label: getLabel(label, type, !!hideLabel),
        html,
        values: values ? values.map((value) => value.label) : undefined,
        content: getContent(content),
        legend,
        description: getTextFromComponentProperty(description),
        additionalDescriptionLabel: getTextFromComponentProperty(additionalDescriptionLabel),
        additionalDescriptionText: getTextFromComponentProperty(additionalDescriptionText),
        data: data?.values ? data.values.map((value) => value.label) : undefined,
        contentForPdf: getTextFromComponentProperty(contentForPdf),
        altText: getTextFromComponentProperty(altText),
        buttonText: getTextFromComponentProperty(buttonText),
        addAnother: getTextFromComponentProperty(addAnother),
        removeAnother: getTextFromComponentProperty(removeAnother),
        attachmentValues: getAttachmentTexts(attachmentValues),
        accordionValues: getAccordionTexts(accordionValues),
      }),
    );

const withoutDuplicatedComponents = (textObject: TextObjectType, index: number, currentComponents: TextObjectType[]) =>
  index === currentComponents.findIndex((currentComponent) => currentComponent.text === textObject.text);

const textObject = (withInputType: boolean, value: string): TextObjectType => {
  const type = withInputType ? getInputType(value) : undefined;
  return {
    text: value,
    ...(type && { type }),
  };
};

const getAccordionTexts = (accordionValues?: AccordionSettingValues): undefined | string[] => {
  if (!accordionValues) {
    return undefined;
  }

  return accordionValues.flatMap((value: AccordionSettingValue) => {
    return [value.title, value.content];
  });
};

const getAttachmentTexts = (attachmentValues?: AttachmentSettingValues): undefined | string[] => {
  if (!attachmentValues) {
    return undefined;
  }

  return Object.entries(attachmentValues).flatMap(([key, value]: [string, AttachmentSettingValue]) => {
    const option = value.enabled ? [TEXTS.statiske.attachment[key]] : [];
    const additionalDocumentation = value.additionalDocumentation
      ? [value?.additionalDocumentation?.label, value?.additionalDocumentation?.description]
      : [];
    return [...option, ...additionalDocumentation];
  });
};

const getFormTexts = (form?: NavFormType, withInputType = false): TextObjectType[] => {
  if (!form) {
    return [];
  }

  const simplifiedComponentObject = [
    {
      title: form.title,
    } as Component,
    ...getTranslatablePropertiesFromForm(form),
  ];

  return simplifiedComponentObject
    .flatMap((component) =>
      Object.keys(component)
        .filter((key) => component[key] !== undefined)
        .flatMap((key) => {
          if (key === 'values' || key === 'data' || key === 'accordionValues' || key === 'attachmentValues') {
            return component[key]
              .filter((value) => !!value)
              .map((value) => textObject(withInputType, value)) as TextObjectType;
          }
          return textObject(withInputType, component[key]);
        }),
    )
    .concat(extractTextsFromProperties(form.properties))
    .filter((component, index, currentComponents) => withoutDuplicatedComponents(component, index, currentComponents));
};

const removeLineBreaks = (text?: string) => (text ? text.replace(/(\r\n|\n|\r)/gm, ' ') : text);

const escapeQuote = (text?: string) => {
  if (typeof text === 'string' && text.includes('"')) {
    return text.replace(/"/g, '""');
  }
  return text;
};

const sanitizeForCsv = (text?: string) => escapeQuote(removeLineBreaks(text));

const createTranslationsTextRow = (
  text: string,
  translations: FormioTranslationMap,
  order: string,
  type: 'tekst' | 'html' = 'tekst',
): CsvRow => {
  return Object.entries(translations).reduce(
    (prevFormRowObject, [languageCode, currentTranslations]) => {
      const translationObject = currentTranslations.translations[text];
      if (!translationObject || !translationObject.value) {
        return prevFormRowObject;
      }
      const sanitizedTranslation = sanitizeForCsv(translationObject.value)!;
      const translation =
        translationObject.scope === 'global' ? sanitizedTranslation.concat(' (Global Tekst)') : sanitizedTranslation;
      return {
        ...prevFormRowObject,
        [languageCode]: translation,
      };
    },
    { type, order, text: sanitizeForCsv(text)! },
  );
};

const getTranslationsForChild = (
  translations: { [lang: string]: { translations: { value: HtmlAsJsonElement | HtmlAsJsonTextElement | undefined } } },
  childIndex: number,
) =>
  Object.entries(translations ?? {}).reduce(
    (acc, [lang, translation]) => ({
      ...acc,
      [lang]: { translations: { value: htmlConverter.getChild(translation.translations.value, childIndex) } },
    }),
    {},
  );

const createTranslationsHtmlRows = (
  htmlElementAsJson: HtmlAsJsonElement | HtmlAsJsonTextElement,
  translations: { [lang: string]: { translations: { value: HtmlAsJsonElement | HtmlAsJsonTextElement | undefined } } },
  order: string,
  htmlOrder: number = 0,
): CsvRow[] => {
  if (htmlElementAsJson.type === 'TextElement' && htmlElementAsJson.textContent) {
    const textTranslations: FormioTranslationMap = Object.entries(translations).reduce(
      (acc, [lang, translation]) => ({
        ...acc,
        [lang]: {
          translations: {
            [htmlElementAsJson.textContent!]: {
              value:
                translation.translations.value?.type === 'TextElement'
                  ? translation.translations.value.textContent
                  : '',
            },
          },
        },
      }),
      {},
    );
    return [
      createTranslationsTextRow(
        htmlElementAsJson.textContent,
        textTranslations,
        `${order}-${String(++htmlOrder).padStart(3, '0')}`,
        'html',
      ),
    ];
  } else if (htmlElementAsJson.type === 'Element') {
    return htmlElementAsJson.children.flatMap((child, index) => {
      const rows = createTranslationsHtmlRows(child, getTranslationsForChild(translations, index), order, htmlOrder);
      htmlOrder += rows.length;
      return rows;
    });
  }
  return [];
};

const getTextsAndTranslationsForForm = (form: NavFormType, translations: FormioTranslationMap): CsvRow[] => {
  const textComponents = getFormTexts(form, false);
  let textIndex = 0;
  return textComponents.flatMap((textComponent) => {
    if (htmlConverter.isHtmlString(textComponent.text)) {
      const htmlTranslations = Object.entries(translations).reduce((acc, [lang, translation]) => {
        const translationValue = translation.translations[textComponent.text]?.value ?? '';
        if (!htmlConverter.isHtmlString(translationValue)) {
          return acc;
        }
        const translationAsJson = new StructuredHtmlElement(translationValue, {
          skipConversionWithin: htmlConverter.defaultLeaves,
        }).toJson(true);
        return {
          ...acc,
          [lang]: { translations: { ...translation.translations[textComponent.text], value: translationAsJson } },
        };
      }, {});
      const htmlText = new StructuredHtmlElement(textComponent.text, {
        skipConversionWithin: htmlConverter.defaultLeaves,
      }).toJson(true);
      return createTranslationsHtmlRows(htmlText, htmlTranslations, `${++textIndex}`.padStart(3, '0'));
    } else {
      return createTranslationsTextRow(textComponent.text, translations, `${++textIndex}`.padStart(3, '0'));
    }
  });
};

const getTextsAndTranslationsHeaders = (translations: FormioTranslationMap) => {
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
    [
      { label: 'Type', key: 'type' },
      { label: 'Rekkefølge', key: 'order' },
      { label: 'Skjematekster', key: 'text' },
    ],
  );
};

export {
  getFormTexts,
  getInputType,
  getTextsAndTranslationsForForm,
  getTextsAndTranslationsHeaders,
  sanitizeForCsv,
  withoutDuplicatedComponents,
};
export type { InputType };
