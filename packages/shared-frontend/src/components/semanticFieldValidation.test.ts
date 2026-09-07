import { describe, expect, it } from 'vitest';
import { toAccountNumberValidation } from './account-number/AccountNumber';
import { toEmailValidation } from './email/Email';
import { toIbanValidation } from './iban/Iban';
import { toNationalIdentityNumberValidation } from './national-identity-number/NationalIdentityNumber';
import { toNumberFieldValidation } from './number-field/NumberField';
import { toOrganizationNumberValidation } from './organization-number/OrganizationNumber';
import { toPostalCodeValidation } from './postal-code/PostalCode';
import { toYearValidation } from './year/Year';

const input = { statePath: 'answer', label: 'Answer', required: true };

describe('semantic field validation', () => {
  it('adds each semantic field intrinsic rule through its component-owned builder', () => {
    expect(toEmailValidation(input).rules).toMatchObject({ required: true, email: true });
    expect(toAccountNumberValidation(input).rules).toMatchObject({ required: true, accountNumber: true });
    expect(toIbanValidation(input).rules).toMatchObject({ required: true, iban: true });
    expect(toOrganizationNumberValidation(input).rules).toMatchObject({ required: true, organizationNumber: true });
    expect(toNationalIdentityNumberValidation(input).rules).toMatchObject({
      required: true,
      nationalIdentityNumber: true,
    });
    expect(toPostalCodeValidation(input).rules).toMatchObject({ required: true, postalCode: true });
    expect(toYearValidation(input).rules).toMatchObject({ required: true, year: true });
    expect(toNumberFieldValidation(input, 'decimal').rules).toMatchObject({ required: true, numberType: 'decimal' });
  });
});
