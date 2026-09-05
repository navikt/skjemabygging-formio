import { Submission } from '../../models';
import { submissionUtils } from '../submission';
import { OrganizationValue, PartyValueLookup, PersonValue, UserValue, isPartyRelationship } from './partyResolver';

interface PartyValuePaths {
  relationship: string;
  user: string;
  sender?: string;
  organization?: string;
  navUnit?: string;
}

const getValue = (path: string | undefined, submission: Submission): unknown =>
  path ? submissionUtils.getSubmissionValue(path, submission) : undefined;

const getObjectValue = <T>(path: string | undefined, submission: Submission): T | undefined => {
  const value = getValue(path, submission);
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as T) : undefined;
};

const createPartyPathLookup = (paths: PartyValuePaths): PartyValueLookup => ({
  relationship: (submission) => {
    const value = getValue(paths.relationship, submission);
    return isPartyRelationship(value) ? value : undefined;
  },
  user: (submission) => getObjectValue<UserValue>(paths.user, submission),
  sender: (submission) => getObjectValue<PersonValue>(paths.sender, submission),
  organization: (submission) => getObjectValue<OrganizationValue>(paths.organization, submission),
  navUnit: (submission) => {
    const value = getValue(paths.navUnit, submission);
    return typeof value === 'string' ? value : undefined;
  },
});

export { createPartyPathLookup };
export type { PartyValuePaths };
