const isOrganizationNumber = (organizationNumber: string) => {
  organizationNumber = removeSpaces(organizationNumber);
  if (/^\d{9}$/.test(organizationNumber)) {
    return mod11(organizationNumber, [3, 2, 7, 6, 5, 4, 3, 2]);
  }
  return false;
};

const isAccountNumber = (accountNumber: string) => {
  accountNumber = removeSpaces(accountNumber);
  if (/^\d{11}$/.test(accountNumber)) {
    return mod11(accountNumber, [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]);
  }
  return false;
};

const mod11 = (value: string, weights: Array<number>) => {
  let sum = 0;
  weights.forEach((element, index) => {
    sum += parseInt(value.charAt(index), 10) * element;
  });
  const checkDigit = parseInt(value.slice(-1), 10);
  const remainder = sum % 11;
  return checkDigit === (remainder === 0 ? 0 : 11 - remainder);
};

const isValidFoerstesideValue = (value: string) => {
  // Regex is from "foerstesidegenerator" and checks that a string only contains characters that are defined as valid.
  // https://github.com/navikt/foerstesidegenerator/blob/20170afdb8e8efbfa7ced1940290ff40cdc7bb95/app/src/main/java/no/nav/foerstesidegenerator/service/support/PostFoerstesideRequestValidator.java#L42C70-L42C124
  // The flag /u enables full Unicode support. Allows us to match based on Unicode properties such as:
  // p{L} matches any kind of letter from any language
  // p{N} matches any kind of numeric character in any script
  // p{Zs} matches a whitespace character that is invisible, but does take up space
  const validCharactersRegex = /^[\p{L}\p{N}\p{Zs}\n\t\-./;()":,–_'?&+’%#•@»«§]*$/gu;
  return validCharactersRegex.test(value);
};

const removeSpaces = (input: string) => {
  return input.replace(/\s+/g, '');
};

const validatorUtils = {
  isOrganizationNumber,
  isAccountNumber,
  isValidFoerstesideValue,
};

export default validatorUtils;
