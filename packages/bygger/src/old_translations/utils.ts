import {
  getCountries,
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
  CustomLabels,
  Form,
  FormioTranslationMap,
  Language,
  NavFormType,
  navFormUtils,
  signatureUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';

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

const extractTextsFromProperties = (props: NavFormType['properties']): string[] => {
  const array: string[] = [];
  if (props?.innsendingOverskrift) {
    array.push(props.innsendingOverskrift);
  }
  if (props?.innsendingForklaring) {
    array.push(props.innsendingForklaring);
  }
  if (props?.declarationText) {
    array.push(props.declarationText);
  }
  if (props?.downloadPdfButtonText) {
    array.push(props.downloadPdfButtonText);
  }
  if (props?.descriptionOfSignatures) {
    array.push(props.descriptionOfSignatures);
  }
  if (props?.signatures) {
    signatureUtils.mapBackwardCompatibleSignatures(props.signatures).forEach((signature) => {
      if (signature.label) {
        array.push(signature.label);
      }
      if (signature.description) {
        array.push(signature.description);
      }
    });
  }
  return array;
};

const getLabelsAndDescriptions = (values?: Array<{ label: string; value: string; description?: string }>) =>
  values ? values.flatMap(({ label, description }) => [label, description]) : undefined;

const getContent = (content: string | undefined): string | undefined => {
  if (content) {
    // Formio.js runs code that changes the original text before translating,
    // and to avoid mismatch in translation object keys we need to do the same.
    // @ts-expect-error
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

const getTranslatablePropertiesFromForm = (form: Form) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.type !== 'hidden')
    .map(
      ({
        content,
        title,
        label,
        customLabels,
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
        customLabels: getCustomLabels(customLabels),
        html,
        values: getLabelsAndDescriptions(values),
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

const withoutDuplicatedComponents = (text: string, index: number, currentTexts: string[]) =>
  index === currentTexts.findIndex((currentText) => currentText === text);

const getAccordionTexts = (accordionValues?: AccordionSettingValues): undefined | string[] => {
  if (!accordionValues) {
    return undefined;
  }

  return accordionValues.flatMap((value: AccordionSettingValue) => {
    return [value.title, value.content];
  });
};

const getCustomLabels = (customLabels?: CustomLabels): undefined | string[] => {
  if (!customLabels) {
    return undefined;
  }

  return Object.entries(customLabels).map(([_key, customLabel]) => {
    return customLabel;
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

const getFormTexts = (form?: Form): string[] => {
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
          if (
            key === 'values' ||
            key === 'data' ||
            key === 'accordionValues' ||
            key === 'attachmentValues' ||
            key === 'customLabels'
          ) {
            return (component[key] as any).filter((value) => !!value).map((value) => `${value}`);
          }
          return component[key];
        }),
    )
    .concat(extractTextsFromProperties(form.properties))
    .filter((component, index, currentComponents) => withoutDuplicatedComponents(component, index, currentComponents));
};

const getFormTextsWithoutCountryNames = (form: Form) => {
  // We filter out any country names to avoid having to maintain their translations
  // All country names on 'nn' and 'en' are added from a third party package when we build the i18n object in FyllUt)
  const countries = getCountries('nb');
  return getFormTexts(form).filter((text) => !countries.some((country) => country.label === text));
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

const getTextsAndTranslationsForForm = (form: Form, translations: FormioTranslationMap): CsvRow[] => {
  const formTexts = getFormTextsWithoutCountryNames(form);
  let textIndex = 0;
  return formTexts.flatMap((text) => {
    if (htmlConverter.isHtmlString(text)) {
      const htmlTranslations = Object.entries(translations).reduce((acc, [lang, translation]) => {
        const translationValue = translation.translations[text]?.value ?? '';
        if (!htmlConverter.isHtmlString(translationValue)) {
          return acc;
        }
        const translationAsJson = new StructuredHtmlElement(translationValue, {
          skipConversionWithin: htmlConverter.defaultLeaves,
        }).toJson({ getMarkdown: true });
        return {
          ...acc,
          [lang]: { translations: { ...translation.translations[text], value: translationAsJson } },
        };
      }, {});
      const htmlText = new StructuredHtmlElement(text, {
        skipConversionWithin: htmlConverter.defaultLeaves,
      }).toJson({ getMarkdown: true });
      return createTranslationsHtmlRows(htmlText, htmlTranslations, `${++textIndex}`.padStart(3, '0'));
    } else {
      return createTranslationsTextRow(text, translations, `${++textIndex}`.padStart(3, '0'));
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
  getFormTextsWithoutCountryNames,
  getInputType,
  getTextsAndTranslationsForForm,
  getTextsAndTranslationsHeaders,
  sanitizeForCsv,
  withoutDuplicatedComponents,
};
export type { InputType };
