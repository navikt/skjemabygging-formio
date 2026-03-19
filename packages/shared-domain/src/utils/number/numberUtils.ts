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

const toLocaleString = (value?: string | number, options: Intl.NumberFormatOptions = { maximumFractionDigits: 2 }) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  // Problem on number component since toLocaleString \u002d (hyphen-minus) with \u2212 (minus) and that causes problem.
  return number.toLocaleString('no', options).replace('\u2212', '-');
};

const numberUtils = {
  isValidDecimal,
  isValidInteger,
  isBiggerOrEqualMin,
  isSmallerOrEqualMax,
  toLocaleString,
};

export { numberUtils };
