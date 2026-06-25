import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import {
  AttachmentSettingValue,
  AttachmentSettingValues,
  Form,
  I18nTranslationReplacements,
  LimitedFormAttachment,
  TEXTS,
  navFormUtils,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { formService, translationsService } from '../../../services';

type TranslateFunction = (text: string, textReplacements?: I18nTranslationReplacements) => string;

const form = {
  get: async (req: Request, res: Response) => {
    const formPath = requestUtil.getStringParam(req, 'formPath')!;
    const type = req.query.type as string | undefined;
    const lang = req.query.lang as string | undefined;
    const select = req.query.select as string | undefined;
    const form = select
      ? await formService.getForm({ formPath, select: select.split(',') as Array<keyof Form> })
      : await formService.getForm({ formPath });

    const language = lang ?? 'nb-NO';

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

const mapLimitedForm = (form: Form, translate: TranslateFunction) => {
  return {
    _id: form.id ? String(form.id) : undefined,
    title: translate(form.title),
    path: form.path,
    modified: form.publishedAt ?? form.changedAt,
    properties: {
      skjemanummer: form.properties.skjemanummer,
      tema: form.properties.tema,
      submissionTypes: form.properties.submissionTypes,
      subsequentSubmissionTypes: form.properties.subsequentSubmissionTypes,
      enhetstyper: form.properties.enhetstyper,
      enhetMaVelgesVedPapirInnsending: form.properties.enhetMaVelgesVedPapirInnsending,
      navUnitDescription: form.properties.navUnitDescription,
      uxSignalsId: form.properties.uxSignalsId,
      uxSignalsSubmissionTypes: form.properties.uxSignalsSubmissionTypes,
      hideUserTypes: form.properties.hideUserTypes,
      publishedLanguages: form.publishedLanguages ?? [],
    },
    attachments: getAttachments(form, translate),
  };
};

const isNonNull = <T>(value: T | null): value is T => {
  return value !== null;
};

const mapAttachmentValues = (
  translate: TranslateFunction,
  form: Form,
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

const getAttachments = (form: Form, translate: TranslateFunction) => {
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
