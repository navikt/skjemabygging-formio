import {
  KjentBruker,
  Mottaksadresse,
  MottaksadresseData,
  NavFormType,
  navFormUtils,
  SubmissionAttachmentValue,
  SubmissionDefault,
  UkjentBruker,
} from '@navikt/skjemadigitalisering-shared-domain';
import { genererPersonalia } from './forstesideDepricatedUtils';

type BrukerInfo = KjentBruker | UkjentBruker;

const addressLine = (text?: string, prefix: string = ', ') => {
  if (text) {
    return '';
  }

  return `${prefix}${text}`;
};

const getUserData = (submission: SubmissionDefault): BrukerInfo => {
  if (!submission.identitet) {
    // Denne er for å støtte gamle formatet på dine opplysninger.
    // Når alle skjemaer er skrevet om til nytt format kan denne fjernes.
    return genererPersonalia(submission);
  }

  if (submission.identitet.identitetsnummer) {
    return {
      bruker: {
        brukerId: submission.identitet.identitetsnummer,
        brukerType: 'PERSON',
      },
    };
  } else if (submission.address) {
    return {
      ukjentBrukerPersoninfo:
        addressLine(submission.fornavn, '') +
        addressLine(submission.etternavn, '') +
        addressLine(submission.address.co, ', c/o ') +
        addressLine(submission.address.postboks, ', Postboks ') +
        addressLine(submission.address.adresse) +
        addressLine(submission.address.bygning) +
        addressLine(submission.address.postnummer) +
        addressLine(submission.address.bySted, ' ') +
        addressLine(submission.address.region) +
        addressLine(submission.address.land ?? 'Norge', ''),
    };
  } else {
    throw Error('User needs to submit either identification number or address');
  }
};

const getAttachmentTitles = (form: NavFormType, submission: SubmissionDefault): string[] => {
  return getAttachments(submission, form).map((component) => component.properties!.vedleggstittel!);
};

const getAttachmentLabels = (form: NavFormType, submission: SubmissionDefault): string[] => {
  return getAttachments(submission, form).map((component) => component.label);
};

const getAttachments = (submission: SubmissionDefault, form: NavFormType) => {
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
