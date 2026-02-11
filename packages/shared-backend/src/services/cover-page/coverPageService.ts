import { CoverPageType, ForstesideRequestBody, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { logger } from '../logger/logger';
import coverPageApiService from './coverPageApiService';

const addressLine = (text?: string, prefix: string = ', ') => {
  return text ? `${prefix}${text}` : '';
};

const getUser = (user) => {
  if (!user) {
    return {};
  }

  if (user.nationalIdentityNumber) {
    return {
      bruker: {
        brukerId: user.nationalIdentityNumber,
        brukerType: 'PERSON',
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

const getRecipient = (recipient) => {
  if (recipient?.name) {
    return {
      adresse: {
        adresselinje1: recipient.name,
        adresselinje2: recipient.postOfficeBox,
        postnummer: recipient.postalCode,
        poststed: recipient.postalName,
      },
    };
  } else if (recipient?.navUnit) {
    return {
      enhetsnummer: recipient.navUnit,
      netsPostboks: '1400',
    };
  } else {
    return {
      netsPostboks: '1400',
    };
  }
};

const parseCoverPageLanguage = (language: string) => {
  switch (language) {
    case 'nn-NO':
    case 'nn':
      return 'NN';
    case 'nb-NO':
    case 'nb':
      return 'NB';
    default:
      return 'EN';
  }
};

interface DownloadCoverPageType {
  baseUrl: string;
  languageCode?: string;
  accessToken?: string;
  data: CoverPageType;
  translate?: TranslateFunction;
}

const downloadCoverPage = async (props: DownloadCoverPageType) => {
  const { baseUrl, languageCode = 'NB', accessToken, data, translate } = props;
  const { type = 'SKJEMA', form, user, recipient, attachments } = data;
  const { properties } = form;

  logger.info(`Download cover page for ${form.skjemanummer}`);

  const formTitle = `${form.skjemanummer} ${translate ? translate(form.title) : form.title}`;

  const body: ForstesideRequestBody = {
    foerstesidetype: type,
    navSkjemaId: form.skjemanummer,
    spraakkode: parseCoverPageLanguage(languageCode),
    overskriftstittel: formTitle,
    arkivtittel: formTitle,
    tema: properties.tema,
    vedleggsliste: attachments,
    dokumentlisteFoersteside: [formTitle, ...attachments],
    ...getUser(user),
    ...getRecipient(recipient),
  };

  return coverPageApiService.downloadCoverPage({
    baseUrl,
    languageCode,
    accessToken,
    body,
  });
};

const coverPageService = {
  downloadCoverPage,
};

export default coverPageService;
