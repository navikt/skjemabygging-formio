import { getCountries, NavFormioJs } from '@navikt/skjemadigitalisering-shared-components';

import {
  AccordionSettingValue,
  AccordionSettingValues,
  AttachmentSettingValue,
  AttachmentSettingValues,
  Component,
  CustomLabels,
  externalStorageTexts,
  Form,
  FormPropertiesType,
  IntroPage,
  navFormUtils,
  signatureUtils,
  TEXTS,
  Tkey,
} from '@navikt/skjemadigitalisering-shared-domain';

const getTextFromComponentProperty = (property: string | undefined) => (property !== '' ? property : undefined);

const extractTextsFromIntroPage = (introPage?: IntroPage): string[] => {
  if (!introPage) return [];
  const { introduction, importantInformation, sections } = introPage;
  return [
    ...[introduction],
    ...Object.values(importantInformation ?? {}),
    ...Object.values(sections ?? {}).flatMap(({ title, description, bulletPoints }) => [
      title,
      description,
      ...(bulletPoints ?? []),
    ]),
  ].filter((value): value is string => value !== undefined);
};

const extractTextsFromProperties = (props: FormPropertiesType): string[] => {
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
    // @ts-expect-error Formio.js runs code that changes the original text before translating, and to avoid mismatch in translation object keys we need to do the same.
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

const extractAllFormTexts = (form?: Form): string[] => {
  if (!form) {
    return [];
  }

  const simplifiedComponentObject = [
    {
      title: form.title,
    } as Component,
    ...getTranslatablePropertiesFromForm(form),
  ];

  const fromIntroPage = extractTextsFromIntroPage(form.introPage);

  return [
    ...fromIntroPage,
    ...simplifiedComponentObject.flatMap((component) =>
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
    ),
    ...extractTextsFromProperties(form.properties),
  ].filter((text, index, currentTexts) => withoutDuplicatedComponents(text, index, currentTexts));
};

const getTextKeysFromForm = (form: Form) => {
  // The following form texts should not be maintained as form translations:
  // - Country names (handled by a third party package and added to the i18n object in FyllUt)
  // - Global intro page texts (should not be overwritten in form translations)
  const countries = getCountries('nb');
  return extractAllFormTexts(form)
    .filter((text) => !countries.some((country) => country.label === text))
    .filter((text) => !!text && !externalStorageTexts.keys.introPage.includes(text as Tkey));
};

export { getTextKeysFromForm };
