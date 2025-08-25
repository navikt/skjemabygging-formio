export const orgNrRegex = /^(\d{3})(\d{3})(\d{3})$/;
export const bankAccountRegex = /^(\d{4})(\d{2})(\d{5})$/;

export function removeAllSpaces(value: string): string {
  return value.replace(/\s+/g, '');
}

export function replaceCommaWithDot(value: string): string {
  return value.replace(/,/g, '.');
}

export function removeAllSpacesAndReplaceCommaWithDot(value: string): string {
  return value.replace(/\s+/g, '').replace(/,/g, '.');
}

export function removeAllSpacesAndCommas(value: string): string {
  return value.replace(/\s+/g, '').replace(/,/g, '');
}

export function formatIBAN(value: string): string {
  return value.replace(/(.{4})/g, '$1 ');
}

export function formatAccountNumber(value: string): string {
  return value.replace(bankAccountRegex, '$1 $2 $3');
}

export function formatNumber(value: string, isInteger: boolean): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }

  const normalizedValue = value?.toString().replace(',', '.') ?? value;
  const number = Number(normalizedValue);

  if (Number.isNaN(number)) {
    return value;
  }

  return number.toLocaleString('no', {
    style: 'decimal',
    minimumFractionDigits: isInteger ? 0 : 2,
    maximumFractionDigits: isInteger ? 0 : 2,
  });
}

export function formatNationalIdentityNumber(value: string): string {
  return value.replace(/(\d{6})(\d{5})/, '$1 $2');
}

export function formatOrganizationNumber(value: string): string {
  return value.replace(orgNrRegex, '$1 $2 $3');
}

export function formatPhoneNumber(value: string, areaCode: string): string {
  if (areaCode && areaCode === '+47' && value.length === 8) {
    return value.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  return value;
}
