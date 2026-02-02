import { NavFormType, Submission, SubmissionData } from '../form';
import {
  ForstesideRecipientAddress,
  ForstesideRequestBody,
  I18nTranslationReplacements,
  KjentBruker,
  navFormUtils,
  Recipient,
  SubmissionAttachmentValue,
  UkjentBruker,
  yourInformationUtils,
} from '../index';
import { genererPersonalia } from './forstesideDepricatedUtils';

type BrukerInfo = KjentBruker | UkjentBruker;

const addressLine = (text?: string, prefix: string = ', ') => {
  if (!text) {
    return '';
  }

  return `${prefix}${text}`;
};

const getUserData = (form: NavFormType, submission: SubmissionData): BrukerInfo => {
  const yourInformation = yourInformationUtils.getYourInformation(form, submission);

  if (!yourInformation) {
    // Denne er for å støtte gamle formatet på dine opplysninger.
    // Når alle skjemaer er skrevet om til nytt format kan denne fjernes.
    return genererPersonalia(submission);
  }

  if (yourInformation.identitet?.identitetsnummer) {
    return {
      bruker: {
        brukerId: yourInformation.identitet.identitetsnummer,
        brukerType: 'PERSON',
      },
    };
  } else if (yourInformation.adresse) {
    const address = yourInformation.adresse;
    return {
      ukjentBrukerPersoninfo:
        addressLine(yourInformation.fornavn, '') +
        addressLine(yourInformation.etternavn, ' ') +
        addressLine(address.co, ', c/o ') +
        addressLine(address.postboks, ', Postboks ') +
        addressLine(address.adresse) +
        addressLine(address.bygning) +
        addressLine(address.postnummer) +
        addressLine(address.bySted, ' ') +
        addressLine(address.region) +
        addressLine(address.land?.label ?? 'Norge'),
    };
  } else {
    throw Error('User needs to submit either identification number or address');
  }
};

const getAttachmentTitles = (form: NavFormType, submission: Submission): string[] => {
  return getAttachments(submission, form).map((component) => component.properties!.vedleggstittel!);
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

const getTitle = (title: string, number: string) => {
  return `${number} ${title}`;
};

const parseLanguage = (language: string) => {
  switch (language) {
    case 'nn-NO':
      return 'NN';
    case 'nb-NO':
      return 'NB';
    default:
      return 'EN';
  }
};

const getRecipients = (
  id?: string,
  recipients?: Recipient[],
  unitNumber?: string,
): { adresse: ForstesideRecipientAddress } | { enhetsnummer?: string; netsPostboks: string } => {
  if (id && recipients) {
    const recipient = recipients.find((r) => r.recipientId === id);
    if (recipient) {
      return {
        adresse: {
          adresselinje1: recipient.name,
          adresselinje2: recipient.poBoxAddress,
          postnummer: recipient.postalCode,
          poststed: recipient.postalName,
        },
      };
    }
  }
  if (unitNumber) {
    return {
      enhetsnummer: unitNumber,
      netsPostboks: '1400',
    };
  }
  return { netsPostboks: '1400' };
};

const genererFoerstesideData = (
  form: NavFormType,
  submission: Submission,
  language = 'nb-NO',
  recipients: Recipient[] = [],
  unitNumber?: string,
  translate?: (text: string, textReplacements?: I18nTranslationReplacements) => string,
): ForstesideRequestBody => {
  const {
    properties: { skjemanummer, tema, mottaksadresseId },
    title,
  } = form;

  const formTitle = getTitle(translate ? translate(title) : title, skjemanummer);

  return {
    ...getUserData(form, submission.data),
    foerstesidetype: 'SKJEMA',
    navSkjemaId: skjemanummer,
    spraakkode: parseLanguage(language),
    overskriftstittel: formTitle,
    arkivtittel: formTitle,
    tema,
    vedleggsliste: getAttachmentTitles(form, submission),
    dokumentlisteFoersteside: [formTitle, ...getAttachmentLabels(form, submission, translate)],
    ...getRecipients(mottaksadresseId, recipients, unitNumber),
  };
};

export {
  genererFoerstesideData,
  getAttachmentLabels,
  getAttachments,
  getAttachmentTitles,
  getRecipients,
  getTitle,
  getUserData,
  parseLanguage,
};
