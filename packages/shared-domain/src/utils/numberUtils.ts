const isValidDecimal = (value: string) => {
  return /^-?\d+\.?\d{0,2}$/.test(value);
};

const isValidInteger = (value: string) => {
  return /^-?\d+$/.test(value);
};

const isBiggerOrEqualMin = (value?: string | number, min?: string | number) => {
  if (min === undefined || min === null || min === '') {
    return true;
  }

  const valueFloat = Number(value);
  const minFloat = Number(min);

  if (Number.isNaN(valueFloat) || Number.isNaN(minFloat)) {
    return true;
  }

  return valueFloat >= minFloat;
};

const isSmallerOrEqualMax = (value?: string | number, max?: string | number) => {
  if (max === undefined || max === null || max === '') {
    return true;
  }

  const valueFloat = Number(value);
  const maxFloat = Number(max);

  if (Number.isNaN(valueFloat) || Number.isNaN(maxFloat)) {
    return true;
  }

  return valueFloat <= maxFloat;
};

const toLocaleString = (value?: string | number, digits?: number) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  const options = {};
  if (digits && digits > 0) {
    options['maximumFractionDigits'] = digits;
  }

  return number.toLocaleString('no', options);
};

const numberUtils = {
  isValidDecimal,
  isValidInteger,
  isBiggerOrEqualMin,
  isSmallerOrEqualMax,
  toLocaleString,
};

export default numberUtils;
