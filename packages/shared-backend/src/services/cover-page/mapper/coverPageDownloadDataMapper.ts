import {
  CoverPageDownloadType,
  Form,
  I18nTranslationReplacements,
  Recipient,
  Submission,
  SubmissionAttachmentValue,
  SubmissionMethod,
  SubmissionType,
  TranslationLang,
  navFormUtils,
  resolveParty,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getCoverPageOrganizationUser, mapPartyToCoverPage } from './coverPagePartyMapper';

const getAttachments = (submission: Submission, form: Form) => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .filter((component) => {
      const submissionData = { ...submission.data };
      const submissionAttachment =
        submission.attachments?.find((attachment) => navFormUtils.getNavId(component) === attachment.navId)?.value ??
        submissionData[component.key];

      return (
        submissionAttachment === 'leggerVedNaa' ||
        (submissionAttachment as SubmissionAttachmentValue)?.key === 'leggerVedNaa'
      );
    });
};

const getAttachmentLabels = (
  form: Form,
  submission: Submission,
  translate?: (text: string, textReplacements?: I18nTranslationReplacements) => string,
): string[] => {
  return getAttachments(submission, form).map((component) =>
    translate ? translate(component.label) : component.label,
  );
};

const getRecipient = (
  recipientId?: string,
  recipient?: Recipient,
  unitNumber?: string,
): CoverPageDownloadType['recipient'] | undefined => {
  if (recipientId && recipient?.recipientId === recipientId) {
    return {
      name: recipient.name,
      postOfficeBox: recipient.poBoxAddress,
      postalCode: recipient.postalCode,
      postalName: recipient.postalName,
    };
  }

  if (unitNumber) {
    return {
      navUnit: unitNumber,
    };
  }

  return undefined;
};

const asSubmissionType = (submissionMethod?: SubmissionMethod): SubmissionType => {
  switch (submissionMethod) {
    case 'digital':
      return 'DIGITAL';
    case 'digitalnologin':
      return 'DIGITAL_NO_LOGIN';
    case 'paper':
    default:
      return 'PAPER';
  }
};

const asTranslationLanguage = (languageCode?: string): TranslationLang => {
  switch (languageCode?.toLowerCase()) {
    case 'nn':
    case 'nn-no':
      return 'nn';
    case 'en':
      return 'en';
    case 'nb':
    case 'nb-no':
    default:
      return 'nb';
  }
};

const createDownloadDataFromSubmission = (
  form: Form,
  submission: Submission,
  languageCode = 'nb-NO',
  recipient?: Recipient,
  unitNumber?: string,
  translate?: (text: string, textReplacements?: I18nTranslationReplacements) => string,
  submissionMethod: SubmissionMethod = 'paper',
): CoverPageDownloadType => {
  const party = resolveParty(form, submission, { navUnit: unitNumber });
  const coverPageOrganizationUser = getCoverPageOrganizationUser(form, submission.data);
  const partyData = party ? mapPartyToCoverPage(party) : {};

  return {
    type: 'SKJEMA',
    submissionType: asSubmissionType(submissionMethod),
    languageCode: asTranslationLanguage(languageCode),
    form: {
      title: form.title,
      skjemanummer: form.properties.skjemanummer,
      properties: form.properties,
    },
    user: partyData.user ?? coverPageOrganizationUser ?? { firstName: '', surname: '', address: {} },
    recipient: getRecipient(form.properties.mottaksadresseId, recipient, partyData.navUnit ?? unitNumber),
    attachments: getAttachmentLabels(form, submission, translate),
  };
};

const coverPageDownloadDataMapper = {
  createDownloadDataFromSubmission,
};

export { coverPageDownloadDataMapper };
