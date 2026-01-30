import {
  AttachmentSettingValue,
  AttachmentSettingValues,
  I18nTranslationReplacements,
  LimitedFormAttachment,
  NavFormType,
  TEXTS,
  navFormUtils,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { formService, translationsService } from '../../../services';

type TranslateFunction = (text: string, textReplacements?: I18nTranslationReplacements) => string;

const form = {
  get: async (req: Request, res: Response) => {
    const { type, lang, select } = req.query;
    const form = await formService.loadForm(req.params.formPath, select as string);

    if (!form || !form.properties) {
      return res.sendStatus(404);
    }

    const language = (lang ?? 'nb-NO') as string;

    if (type === 'limited') {
      const translations = await translationsService.getTranslationsForLanguage(form.path, language);

      const translate = (text: string, textReplacements?: I18nTranslationReplacements) =>
        translationUtils.translateWithTextReplacements({
          translations,
          textOrKey: text,
          params: textReplacements,
          currentLanguage: language,
        });

      return res.json(mapLimitedForm(form, translate));
    }
    return res.json(form);
  },
};

const mapLimitedForm = (form: NavFormType, translate: TranslateFunction) => {
  return {
    _id: form._id,
    title: translate(form.title),
    path: form.path,
    modified: form.modified,
    properties: {
      skjemanummer: form.properties.skjemanummer,
      tema: form.properties.tema,
      submissionTypes: form.properties.submissionTypes,
      subsequentSubmissionTypes: form.properties.subsequentSubmissionTypes,
      enhetstyper: form.properties.enhetstyper,
      enhetMaVelgesVedPapirInnsending: form.properties.enhetMaVelgesVedPapirInnsending,
      uxSignalsId: form.properties.uxSignalsId,
      uxSignalsSubmissionTypes: form.properties.uxSignalsSubmissionTypes,
      hideUserTypes: form.properties.hideUserTypes,
      publishedLanguages: form.properties.publishedLanguages ?? [],
    },
    attachments: getAttachments(form, translate),
  };
};

const isNonNull = <T>(value: T | null): value is T => {
  return value !== null;
};

const mapAttachmentValues = (
  translate: TranslateFunction,
  form: NavFormType,
  attachmentValues?: AttachmentSettingValues,
): LimitedFormAttachment[] => {
  if (!attachmentValues || Object.keys(attachmentValues).length === 0) {
    return [];
  }

  return Object.entries(attachmentValues)
    .map(([key, value]) => {
      if (value.enabled !== true) return null;

      const data = value as AttachmentSettingValue;
      const attachmentKey = key as keyof AttachmentSettingValues;

      const additionalDocumentationLabel = data?.additionalDocumentation?.label;
      const additionalDocumentationDescription = data?.additionalDocumentation?.description;

      const shouldShowAdditionalDocumentationLabel =
        data?.additionalDocumentation?.enabled && additionalDocumentationLabel;
      const shouldShowAdditionalDocumentationDescription =
        data?.additionalDocumentation?.enabled && additionalDocumentationDescription;
      const shouldShowDeadline = !!data?.showDeadline && form.properties?.ettersendelsesfrist;

      return {
        key,
        description: translate(TEXTS.statiske.attachment[attachmentKey]),
        ...(shouldShowAdditionalDocumentationLabel && {
          additionalDocumentationLabel: translate(additionalDocumentationLabel),
        }),
        ...(shouldShowAdditionalDocumentationDescription && {
          additionalDocumentationDescription: translate(additionalDocumentationDescription),
        }),
        ...(shouldShowDeadline && {
          deadlineWarning: translate(TEXTS.statiske.attachment.deadline, {
            deadline: form.properties?.ettersendelsesfrist,
          }),
        }),
      };
    })
    .filter(isNonNull);
};

const getAttachments = (form: NavFormType, translate: TranslateFunction) => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => !!component.properties?.vedleggskode)
    .map((component) => {
      const attachmentTitle = component.properties?.vedleggstittel;
      const attachmentCode = component.properties?.vedleggskode;
      const attachmentForm = component.properties?.vedleggskjema;

      return {
        label: translate(component.label),
        key: component.key,
        otherDocumentation: component.otherDocumentation,
        ...(component.description && { descrption: translate(component.description) }),
        ...(attachmentTitle && { attachmentTitle: translate(attachmentTitle) }),
        ...(attachmentCode && { attachmentCode }),
        ...(attachmentForm && { attachmentForm }),
        attachmentValues: mapAttachmentValues(translate, form, component.attachmentValues),
      };
    });
};

export default form;
export { mapAttachmentValues };
