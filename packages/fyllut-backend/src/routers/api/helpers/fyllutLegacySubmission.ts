import { SubmissionData } from '@navikt/skjemadigitalisering-shared-domain';

const legacyInputKeys = [
  'fornavnSoker',
  'etternavnSoker',
  'coSoker',
  'postnummerSoker',
  'postnrSoker',
  'utenlandskPostkodeSoker',
  'poststedSoker',
  'landSoker',
  'gateadresseSoker',
  'norskVegadresse',
  'norskPostboksadresse',
  'utenlandskAdresse',
  'fodselsnummerDNummerSoker',
  'fornavnAvsender',
  'etternavnAvsender',
] as const;

const hasFyllutLegacyInput = (submission: SubmissionData): boolean =>
  legacyInputKeys.some((key) => {
    const value = submission[key];
    return value !== undefined && value !== '';
  });

export { hasFyllutLegacyInput };
