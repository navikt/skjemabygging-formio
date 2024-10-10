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
  if (!text) {
    return '';
  }

  return `${prefix}${text}`;
};

const getUserData = (submission: SubmissionDefault): BrukerInfo => {
  if (!submission.dineOpplysninger) {
    // Denne er for å støtte gamle formatet på dine opplysninger.
    // Når alle skjemaer er skrevet om til nytt format kan denne fjernes.
    return genererPersonalia(submission);
  }

  if (submission.dineOpplysninger?.identitet?.identitetsnummer) {
    return {
      bruker: {
        brukerId: submission.dineOpplysninger?.identitet.identitetsnummer,
        brukerType: 'PERSON',
      },
    };
  } else if (submission.dineOpplysninger?.adresse) {
    const address = submission.dineOpplysninger?.adresse;
    return {
      ukjentBrukerPersoninfo:
        addressLine(submission.dineOpplysninger?.fornavn, '') +
        addressLine(submission.dineOpplysninger?.etternavn, ' ') +
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
