import {
  CoverPageDownloadType,
  I18nTranslationReplacements,
  ResponseError,
  stringUtils,
  TEXTS,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ForstesideRequestBody } from '../coverPageRequestTypes';

type DownloadUserData = Pick<ForstesideRequestBody, 'bruker' | 'ukjentBrukerPersoninfo'>;

const addressLine = (text?: string, prefix: string = ', ') => {
  if (!text) {
    return '';
  }

  if (!validatorUtils.isValidCoverPageValue(text)) {
    throw new ResponseError('BAD_REQUEST', 'Invalid value for cover page');
  }

  return `${prefix}${text}`;
};

const getTitle = (title: string, number: string) => {
  return stringUtils.normalizeUnicode(`${number} ${title}`);
};

const parseLanguage = (language: string) => {
  switch (language) {
    case 'nn':
    case 'NN':
    case 'nn-NO':
      return 'NN';
    case 'nb':
    case 'NB':
    case 'nb-NO':
      return 'NB';
    default:
      return 'EN';
  }
};

const createRequestBody = ({
  type = 'SKJEMA',
  formNumber,
  formTitle,
  archiveTitle = formTitle,
  languageCode,
  tema = '',
  vedleggsliste = [],
  dokumentlisteFoersteside = [],
  userData = {},
  recipientData = { netsPostboks: '1400' },
}: {
  type?: ForstesideRequestBody['foerstesidetype'];
  formNumber: string;
  formTitle: string;
  archiveTitle?: string;
  languageCode: string;
  tema?: string;
  vedleggsliste?: string[];
  dokumentlisteFoersteside?: string[];
  userData?: Partial<ForstesideRequestBody>;
  recipientData?: Partial<ForstesideRequestBody>;
}): ForstesideRequestBody => ({
  foerstesidetype: type,
  navSkjemaId: formNumber,
  spraakkode: parseLanguage(languageCode),
  overskriftstittel: formTitle,
  arkivtittel: archiveTitle,
  tema,
  vedleggsliste,
  dokumentlisteFoersteside,
  ...userData,
  ...recipientData,
});

const getDownloadUserData = (user?: CoverPageDownloadType['user']): Partial<DownloadUserData> => {
  if (!user) {
    return {};
  }

  if (user.nationalIdentityNumber) {
    if (!validatorUtils.isValidCoverPageValue(user.nationalIdentityNumber)) {
      throw new ResponseError('BAD_REQUEST', 'Invalid value for cover page');
    }

    return {
      bruker: {
        brukerId: user.nationalIdentityNumber,
        brukerType: 'PERSON',
      },
    };
  }

  if ('organizationNumber' in user && user.organizationNumber) {
    if (!validatorUtils.isValidCoverPageValue(user.organizationNumber)) {
      throw new ResponseError('BAD_REQUEST', 'Invalid value for cover page');
    }

    return {
      bruker: {
        brukerId: user.organizationNumber,
        brukerType: 'ORGANISASJON',
      },
    };
  }

  return {
    ukjentBrukerPersoninfo:
      addressLine(user.firstName, '') +
      addressLine(user.surname, ' ') +
      addressLine(user.address?.co, ', c/o ') +
      addressLine(user.address?.postOfficeBox, ', Postboks ') +
      addressLine(user.address?.streetAddress) +
      addressLine(user.address?.building) +
      addressLine(user.address?.postalCode) +
      addressLine(user.address?.postalName, ' ') +
      addressLine(user.address?.region) +
      addressLine(user.address?.country?.label ?? 'Norge'),
  };
};

const getDownloadRecipientData = (recipient?: CoverPageDownloadType['recipient']) => {
  if (recipient?.name) {
    return {
      adresse: {
        adresselinje1: recipient.name,
        adresselinje2: recipient.postOfficeBox,
        postnummer: recipient.postalCode,
        poststed: recipient.postalName,
      },
    };
  }

  if (recipient?.navUnit) {
    return {
      enhetsnummer: recipient.navUnit,
      netsPostboks: '1400',
    };
  }

  return {
    netsPostboks: '1400',
  };
};

const createRequestBodyFromDownloadData = (
  data: CoverPageDownloadType,
  languageCode = 'NB',
  translate?: (text: string, textReplacements?: I18nTranslationReplacements) => string,
  formNumber?: string,
): ForstesideRequestBody => {
  const { isSubsequentSubmission = false, form, user, recipient, attachments } = data;
  const { properties } = form;

  if (!form.skjemanummer || !form.title) {
    throw new ResponseError('BAD_REQUEST', 'Missing required form values for cover page.');
  }

  const translatedFormTitle = translate ? translate(form.title) : form.title;
  const formTitle = getTitle(translatedFormTitle, form.skjemanummer);
  const coverPageTitle = isSubsequentSubmission
    ? stringUtils.normalizeUnicode(
        translate
          ? translate(TEXTS.statiske.staticPdf.ettersendingCoverPageTitle, {
              formNumber: form.skjemanummer,
              title: form.title,
            })
          : `Ettersending til ${formTitle}`,
      )
    : formTitle;

  return createRequestBody({
    type: isSubsequentSubmission ? 'ETTERSENDELSE' : 'SKJEMA',
    formNumber: formNumber ?? form.skjemanummer,
    formTitle: coverPageTitle,
    archiveTitle: isSubsequentSubmission
      ? stringUtils.normalizeUnicode(`Ettersending til ${form.skjemanummer} ${translatedFormTitle}`)
      : undefined,
    languageCode,
    tema: properties?.tema,
    vedleggsliste: attachments,
    dokumentlisteFoersteside: isSubsequentSubmission ? attachments : [formTitle, ...attachments],
    userData: getDownloadUserData(user),
    recipientData: getDownloadRecipientData(recipient),
  });
};

const coverPageRequestBodyMapper = {
  createRequestBodyFromDownloadData,
};

export { coverPageRequestBodyMapper };
