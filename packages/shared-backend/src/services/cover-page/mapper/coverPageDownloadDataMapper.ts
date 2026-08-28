import {
  CoverPageDownloadType,
  Form,
  I18nTranslationReplacements,
  navFormPartyAdapter,
  partyUtils,
  Recipient,
  ResponseError,
  Submission,
  SubmissionAttachmentValue,
  SubmissionData,
  SubmissionMethod,
  SubmissionType,
  TranslationLang,
  navFormUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { partyProjections } from '../../party';

const getSubmissionPartyData = (form: Form, submission: SubmissionData) => {
  const adapted = navFormPartyAdapter.getCoverPagePartyInput(form, submission);
  if (adapted.type === 'legacyOrganization') {
    return { user: { organizationNumber: adapted.organizationNumber } };
  }
  const result = partyUtils.validateParty(adapted.input);
  if (!result.success) {
    throw new ResponseError('BAD_REQUEST', 'Invalid party data');
  }
  return partyProjections.toCoverPageParties(result.data);
};

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
  const parties = getSubmissionPartyData(form, submission.data);
  return {
    type: 'SKJEMA',
    submissionType: asSubmissionType(submissionMethod),
    languageCode: asTranslationLanguage(languageCode),
    form: {
      title: form.title,
      skjemanummer: form.properties.skjemanummer,
      properties: form.properties,
    },
    user: parties.user,
    recipient: getRecipient(form.properties.mottaksadresseId, recipient, unitNumber) ?? parties.recipient,
    attachments: getAttachmentLabels(form, submission, translate),
  };
};

const coverPageDownloadDataMapper = {
  createDownloadDataFromSubmission,
};

export { coverPageDownloadDataMapper };
