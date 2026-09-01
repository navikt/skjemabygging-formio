import { Form, NavFormType, Party, SubmissionData } from '../../models';
import { senderUtils, yourInformationUtils } from '../submission';
import { ParseOptions, partyUtils } from './partyUtils';

/**
 * Why a submission cannot be expressed as a {@link Party} and has to keep using the mappers that
 * predate the party model. Every reason is registered in
 * https://github.com/navikt/skjemabygging-formio/issues/2180, which tracks what has to be decided
 * before the legacy path can be removed.
 */
type LegacyPartyReason =
  /** L3: the submission carries flat applicant fields instead of a yourInformation container. */
  | 'legacyFields'
  /** L1, L2, L6: the submission is missing or malforms something a party requires. */
  | 'incompleteParty';

type FormParty = { readonly type: 'party'; readonly party: Party } | { readonly type: 'legacy'; readonly reason: LegacyPartyReason };

/** Flat applicant fields from forms built before the yourInformation container existed. */
const LEGACY_FIELD_KEYS = [
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

const hasLegacyFields = (submissionData: SubmissionData) =>
  LEGACY_FIELD_KEYS.some((key) => submissionData[key] !== undefined && submissionData[key] !== '');

/**
 * Reads a submission as a party, or reports that it has to keep using the legacy mappers.
 *
 * Fyllut and sendinn call this the same way: each reads its own `Form` and `SubmissionData` through
 * its own components, and this adapter locates the sender and "Dine opplysninger" values before
 * handing them to the shared parser. Only the registered legacy branches are fyllut-specific — they
 * classify submission shapes that predate the party model, which a form built against this model has
 * no way to produce.
 *
 * Anything the party model cannot hold without losing or inventing data is routed to the legacy
 * path, so adopting the model never changes what an existing form sends.
 */
const getFormParty = (
  form: NavFormType | Form,
  submissionData: SubmissionData,
  options: ParseOptions = {},
): FormParty => {
  if (hasLegacyFields(submissionData)) {
    return { type: 'legacy', reason: 'legacyFields' };
  }
  const sender = senderUtils.getSender(form, submissionData);
  const yourInformation = yourInformationUtils.getYourInformation(form, submissionData);
  const parsed = partyUtils.parseParty({ sender, yourInformation }, options);
  return parsed.ok ? { type: 'party', party: parsed.value } : { type: 'legacy', reason: 'incompleteParty' };
};

const formPartyAdapter = {
  getFormParty,
};

export { formPartyAdapter };
export type { FormParty, LegacyPartyReason };
