export const orgNrRegex = /^(\d{3})(\d{3})(\d{3})$/;
export const bankAccountRegex = /^(\d{4})(\d{2})(\d{5})$/;

export function removeAllSpaces(value: string): string {
  return value.replace(/\s+/g, '');
}

export function formatIBAN(value: string): string {
  return value.replace(/(.{4})/g, '$1 ');
}

export function formatAccountNumber(value: string): string {
  return value.replace(bankAccountRegex, '$1 $2 $3');
}

export function formatCurrency(value: string, isInteger: boolean): string {
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
