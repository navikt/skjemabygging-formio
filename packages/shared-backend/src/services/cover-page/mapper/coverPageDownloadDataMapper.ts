import type { FyllutLegacySubmission } from '@navikt/skjemadigitalisering-shared-domain';
import {
  CoverPageDownloadType,
  Form,
  I18nTranslationReplacements,
  Recipient,
  ResponseError,
  Submission,
  SubmissionAttachmentValue,
  SubmissionData,
  SubmissionMethod,
  SubmissionType,
  TranslationLang,
  formatUtils,
  mapFyllutLegacyAddress,
  navFormUtils,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

type CoverPageUser = CoverPageDownloadType['user'];
type OrganizationNumberUser = Extract<CoverPageUser, { organizationNumber: string }>;

const getOrganizationNumberUser = (form: Form, submission: SubmissionData): OrganizationNumberUser | undefined => {
  const organizationNumberComponent = navFormUtils
    .flattenComponents(form.components)
    .find((component) => component.type === 'orgNr' && component.coverPageUser && submission[component.key]);

  if (!organizationNumberComponent) {
    return undefined;
  }

  const organizationNumber = submission[organizationNumberComponent.key];
  if (!organizationNumber) {
    return undefined;
  }

  const organizationNumberValue = formatUtils.removeAllSpaces(`${organizationNumber}`);
  if (!organizationNumberValue) {
    return undefined;
  }

  return {
    organizationNumber: organizationNumberValue,
  };
};

const getSubmissionUserData = (form: Form, submission: SubmissionData): CoverPageUser => {
  // This remains the fyllut compatibility mapper until #2186 and #2187 are complete and historical identity
  // formatting can be normalized without changing existing cover-page requests.
  const yourInformation = yourInformationUtils.getYourInformation(form, submission);

  if (!yourInformation) {
    const organizationNumberUser = getOrganizationNumberUser(form, submission);
    if (organizationNumberUser) {
      return organizationNumberUser;
    }

    const legacySubmission = submission as FyllutLegacySubmission;
    if (legacySubmission.fodselsnummerDNummerSoker) {
      return {
        nationalIdentityNumber: legacySubmission.fodselsnummerDNummerSoker,
      };
    }

    return {
      firstName: legacySubmission.fornavnSoker ?? '',
      surname: legacySubmission.etternavnSoker ?? '',
      address: mapFyllutLegacyAddress(legacySubmission),
    };
  }

  if (yourInformation.identitet?.identitetsnummer) {
    return {
      nationalIdentityNumber: yourInformation.identitet.identitetsnummer,
    };
  }

  if (yourInformation.adresse) {
    return {
      firstName: yourInformation.fornavn ?? '',
      surname: yourInformation.etternavn ?? '',
      address: {
        co: yourInformation.adresse.co,
        postOfficeBox: yourInformation.adresse.postboks,
        streetAddress: yourInformation.adresse.adresse,
        building: yourInformation.adresse.bygning,
        postalCode: yourInformation.adresse.postnummer,
        postalName: yourInformation.adresse.bySted,
        region: yourInformation.adresse.region,
        country: yourInformation.adresse.land,
      },
    };
  }

  throw new ResponseError('BAD_REQUEST', 'User needs to submit either identification number or address');
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
  return {
    type: 'SKJEMA',
    submissionType: asSubmissionType(submissionMethod),
    languageCode: asTranslationLanguage(languageCode),
    form: {
      title: form.title,
      skjemanummer: form.properties.skjemanummer,
      properties: form.properties,
    },
    user: getSubmissionUserData(form, submission.data),
    recipient: getRecipient(form.properties.mottaksadresseId, recipient, unitNumber),
    attachments: getAttachmentLabels(form, submission, translate),
  };
};

const coverPageDownloadDataMapper = {
  createDownloadDataFromSubmission,
};

export { coverPageDownloadDataMapper };
