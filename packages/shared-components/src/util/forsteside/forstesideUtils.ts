import {
  KjentBruker,
  Mottaksadresse,
  MottaksadresseData,
  NavFormType,
  navFormUtils,
  SubmissionAttachmentValue,
  SubmissionData,
  SubmissionYourInformation,
  UkjentBruker,
} from '@navikt/skjemadigitalisering-shared-domain';
import { genererPersonalia } from './forstesideDepricatedUtils';

type BrukerInfo = KjentBruker | UkjentBruker;

const addressLine = (text?: string, prefix: string = ', ') => {
  if (!text) {
    return '';
  }

  return `${prefix}${text}`;
};

const getUserData = (form: NavFormType, submission: SubmissionData): BrukerInfo => {
  const yourInformation = getFirstYourInformation(form, submission);

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
        addressLine(address.land ?? 'Norge'),
    };
  } else {
    throw Error('User needs to submit either identification number or address');
  }
};

const getFirstYourInformation = (
  form: NavFormType,
  submission: SubmissionData,
): SubmissionYourInformation | undefined => {
  const yourInformationForm = navFormUtils
    .flattenComponents(form.components)
    .find((component) => component.yourInformation && submission[component.key]);

  if (yourInformationForm) {
    return submission[yourInformationForm.key] as SubmissionYourInformation;
  }
};

const getAttachmentTitles = (form: NavFormType, submission: SubmissionData): string[] => {
  return getAttachments(submission, form).map((component) => component.properties!.vedleggstittel!);
};

const getAttachmentLabels = (form: NavFormType, submission: SubmissionData): string[] => {
  return getAttachments(submission, form).map((component) => component.label);
};

const getAttachments = (submission: SubmissionData, form: NavFormType) => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .filter(
      (component) =>
        submission[component.key] === 'leggerVedNaa' ||
        (submission[component.key] as SubmissionAttachmentValue)?.key === 'leggerVedNaa',
    );
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
  recipients?: Mottaksadresse[],
  unitNumber?: string,
): { adresse: MottaksadresseData } | { enhetsnummer?: string; netsPostboks: string } => {
  if (id && recipients) {
    const recipient = recipients.find((a) => a._id === id);
    if (recipient) {
      return { adresse: { ...recipient.data } };
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

export {
  getAttachmentLabels,
  getAttachments,
  getAttachmentTitles,
  getRecipients,
  getTitle,
  getUserData,
  parseLanguage,
};
