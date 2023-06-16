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

const removeSpaces = (input: string) => {
  return input.replace(/\s+/g, "");
};

const validatorUtils = {
  isOrganizationNumber,
  isAccountNumber,
};

export default validatorUtils;
