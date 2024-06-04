interface CurrencyOptions {
  currency?: string;
  iso?: boolean;
  integer?: boolean;
}

const toLocaleString = (value?: string | number, options?: CurrencyOptions) => {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return number.toLocaleString('no', {
    style: 'currency',
    currency: options?.currency || 'nok',
    currencyDisplay: options?.iso ? 'code' : 'symbol',
    minimumFractionDigits: options?.integer ? 0 : undefined,
    maximumFractionDigits: options?.integer ? 0 : undefined,
  });
};

const currencyUtils = {
  toLocaleString,
};

export default currencyUtils;
