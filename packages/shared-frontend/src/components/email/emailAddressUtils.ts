const MAX_LOCAL_PART_OCTETS = 64;
const MAX_ADDRESS_OCTETS = 254;

const atomPattern = /^(?:[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]|[^\p{ASCII}\p{Z}\p{C}])+$/u;
const domainLabelPattern = /^[\p{L}\p{N}](?:[\p{L}\p{M}\p{N}-]{0,61}[\p{L}\p{M}\p{N}])?$/u;
const digitsPattern = /^\p{N}+$/u;

const toOctetLength = (text: string) => new TextEncoder().encode(text).length;

/**
 * A deliverable email address as the standards define it:
 * - before @: an RFC 5322 dot-atom, where RFC 6532 also allows non-ASCII characters
 * - after @: at least two RFC 1034 labels, where RFC 5890 (IDN) also allows letters from other scripts,
 *   and a top-level domain that is not only digits (RFC 3696)
 * - at most 64 octets before @ and 254 octets in total (RFC 5321)
 *
 * Quoted local parts, comments and IP address literals are valid RFC 5322, but are rejected like in the
 * HTML standard's valid email address, since nobody enters them in a form.
 */
const isValidEmailAddress = (value: string) => {
  const [localPart, domain, ...rest] = value.split('@');

  if (domain === undefined || rest.length > 0) {
    return false;
  }

  const labels = domain.split('.');
  const topLevelDomain = labels[labels.length - 1];

  return (
    toOctetLength(localPart) <= MAX_LOCAL_PART_OCTETS &&
    toOctetLength(value) <= MAX_ADDRESS_OCTETS &&
    localPart.split('.').every((atom) => atomPattern.test(atom)) &&
    labels.length > 1 &&
    labels.every((label) => domainLabelPattern.test(label)) &&
    !digitsPattern.test(topLevelDomain)
  );
};

export { isValidEmailAddress };
