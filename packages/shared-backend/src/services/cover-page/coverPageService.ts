import { CoverPageType, ForstesideRequestBody, ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../http/http';
import { logger } from '../logger/logger';

interface DownloadCoverPageType {
  baseUrl: string;
  languageCode?: string;
  accessToken?: string;
  data: CoverPageType;
}

const downloadCoverPage = async (props: DownloadCoverPageType) => {
  const { baseUrl, languageCode = 'NB', accessToken, data } = props;
  const { type = 'SKJEMA', form, user, recipient, attachments } = data;
  const { properties } = form;

  logger.info(`Download cover page for ${form.skjemanummer}`);

  const addressLine = (text?: string, prefix: string = ', ') => {
    return text ? `${prefix}${text}` : '';
  };

  const getUser = () => {
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

  const getRecipient = () => {
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

  const parseLanguage = (language: string) => {
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

  // TODO: Validate all input values
  // TODO: translate, getTitle(translate ? translate(title) : title, skjemanummer);
  const formTitle = `${form.skjemanummer} ${form.title}`;

  const body: ForstesideRequestBody = {
    foerstesidetype: type,
    navSkjemaId: form.skjemanummer,
    spraakkode: parseLanguage(languageCode),
    overskriftstittel: formTitle,
    arkivtittel: formTitle,
    tema: properties.tema,
    vedleggsliste: attachments,
    dokumentlisteFoersteside: [formTitle, ...attachments],
    ...getUser(),
    ...getRecipient(),
  };

  const pdf = await http.post<{
    foersteside: string;
    loepenummer: string;
  }>(`${baseUrl}/foersteside`, body, { accessToken });

  if (!pdf) {
    throw new ResponseError('NOT_FOUND', 'Cover page not found');
  }

  logger.info(`Cover page for ${form.skjemanummer} with id (loepenummer) ${pdf.loepenummer} created successfully`);

  return pdf.foersteside;
};

const coverPageService = {
  downloadCoverPage,
};

export default coverPageService;
