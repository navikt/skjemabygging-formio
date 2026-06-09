import { orgNrRegex } from '../../../utils/format/formatUtils';

const formatOrganizationNumber = (value: string): string => {
  const [orgNrMatch, ...orgNrGroups] = (typeof value === 'string' && value?.match(orgNrRegex)) || [];
  if (orgNrMatch) {
    return orgNrGroups.join(' ');
  }
  return value;
};

export { formatOrganizationNumber };
