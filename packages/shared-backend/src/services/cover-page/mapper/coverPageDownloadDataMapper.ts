import {
  CoverPageDownloadType,
  I18nTranslationReplacements,
  NavFormType,
  Recipient,
  ResponseError,
  Submission,
  SubmissionAttachmentValue,
  SubmissionData,
  SubmissionMethod,
  SubmissionType,
  TranslationLang,
  formatUtils,
  navFormUtils,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

const getOrganizationNumberUser = (
  form: NavFormType,
  submission: SubmissionData,
): CoverPageDownloadType['user'] | undefined => {
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
  } as CoverPageDownloadType['user'];
};

type LegacySubmission = {
  fornavnSoker?: string;
  etternavnSoker?: string;
  coSoker?: string;
  postnummerSoker?: string;
  postnrSoker?: string;
  utenlandskPostkodeSoker?: string;
  poststedSoker?: string;
  landSoker?: string;
  gateadresseSoker?: string;
  norskVegadresse?: {
    coSoker?: string;
    vegadresseSoker?: string;
    postnrSoker?: string;
    poststedSoker?: string;
  };
  norskPostboksadresse?: {
    coSoker?: string;
    postboksNrSoker?: string;
    postnrSoker?: string;
    poststedSoker?: string;
  };
  utenlandskAdresse?: {
    coSoker?: string;
    postboksNrSoker?: string;
    bygningSoker?: string;
    postkodeSoker?: string;
    poststedSoker?: string;
    landSoker?: string;
    regionSoker?: string;
  };
  fodselsnummerDNummerSoker?: string;
};

const getLegacyAddress = (submission: LegacySubmission) => {
  const {
    coSoker,
    gateadresseSoker,
    poststedSoker,
    postnummerSoker,
    postnrSoker,
    landSoker,
    utenlandskPostkodeSoker,
    norskVegadresse,
    norskPostboksadresse,
    utenlandskAdresse,
  } = submission;

  return {
    co: norskVegadresse?.coSoker || utenlandskAdresse?.coSoker || coSoker,
    postOfficeBox:
      (norskPostboksadresse?.postboksNrSoker && `Postboks ${norskPostboksadresse.postboksNrSoker}`) ||
      utenlandskAdresse?.postboksNrSoker,
    streetAddress: norskVegadresse?.vegadresseSoker || gateadresseSoker,
    building: utenlandskAdresse?.bygningSoker,
    postalCode:
      norskVegadresse?.postnrSoker ||
      norskPostboksadresse?.postnrSoker ||
      utenlandskAdresse?.postkodeSoker ||
      postnrSoker ||
      utenlandskPostkodeSoker ||
      postnummerSoker,
    postalName:
      norskVegadresse?.poststedSoker ||
      norskPostboksadresse?.poststedSoker ||
      utenlandskAdresse?.poststedSoker ||
      poststedSoker,
    region: utenlandskAdresse?.regionSoker,
    country: {
      value: landSoker || utenlandskAdresse?.landSoker || (norskVegadresse || norskPostboksadresse ? 'Norge' : ''),
      label: landSoker || utenlandskAdresse?.landSoker || (norskVegadresse || norskPostboksadresse ? 'Norge' : ''),
    },
  };
};

const getSubmissionUserData = (form: NavFormType, submission: SubmissionData): CoverPageDownloadType['user'] => {
  const yourInformation = yourInformationUtils.getYourInformation(form, submission);

  if (!yourInformation) {
    const organizationNumberUser = getOrganizationNumberUser(form, submission);
    if (organizationNumberUser) {
      return organizationNumberUser;
    }

    const legacySubmission = submission as LegacySubmission;
    if (legacySubmission.fodselsnummerDNummerSoker) {
      return {
        nationalIdentityNumber: legacySubmission.fodselsnummerDNummerSoker,
      };
    }

    return {
      firstName: legacySubmission.fornavnSoker ?? '',
      surname: legacySubmission.etternavnSoker ?? '',
      address: getLegacyAddress(legacySubmission),
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

const getAttachments = (submission: Submission, form: NavFormType) => {
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
  form: NavFormType,
  submission: Submission,
  translate?: (text: string, textReplacements?: I18nTranslationReplacements) => string,
): string[] => {
  return getAttachments(submission, form).map((component) =>
    translate ? translate(component.label) : component.label,
  );
};

const getRecipient = (
  recipientId?: string,
  recipients?: Recipient[],
  unitNumber?: string,
): CoverPageDownloadType['recipient'] | undefined => {
  if (recipientId && recipients) {
    const recipient = recipients.find((currentRecipient) => currentRecipient.recipientId === recipientId);
    if (recipient) {
      return {
        name: recipient.name,
        postOfficeBox: recipient.poBoxAddress,
        postalCode: recipient.postalCode,
        postalName: recipient.postalName,
      };
    }
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
  form: NavFormType,
  submission: Submission,
  languageCode = 'nb-NO',
  recipients: Recipient[] = [],
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
    recipient: getRecipient(form.properties.mottaksadresseId, recipients, unitNumber),
    attachments: getAttachmentLabels(form, submission, translate),
  };
};

const coverPageDownloadDataMapper = {
  createDownloadDataFromSubmission,
};

export { coverPageDownloadDataMapper };
