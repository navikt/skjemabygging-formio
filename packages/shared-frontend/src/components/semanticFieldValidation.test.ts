import { describe, expect, it } from 'vitest';
import { toAccountNumberValidation } from './account-number/accountNumberValidation';
import { toEmailValidation } from './email/emailValidation';
import { toIbanValidation } from './iban/ibanValidation';
import { toNationalIdentityNumberValidation } from './national-identity-number/nationalIdentityNumberValidation';
import { toNumberFieldValidation } from './number-field/numberFieldValidation';
import { toOrganizationNumberValidation } from './organization-number/organizationNumberValidation';
import { toPostalCodeValidation } from './postal-code/postalCodeValidation';
import { toYearValidation } from './year/yearValidation';

const input = { statePath: 'answer', label: 'Answer', required: true };

describe('semantic field validation', () => {
  it('adds each semantic field intrinsic rule through its pure builder', () => {
    expect({
      email: toEmailValidation(input).rules,
      accountNumber: toAccountNumberValidation(input).rules,
      iban: toIbanValidation(input).rules,
      organizationNumber: toOrganizationNumberValidation(input).rules,
      nationalIdentityNumber: toNationalIdentityNumberValidation(input).rules,
      postalCode: toPostalCodeValidation(input).rules,
      year: toYearValidation(input).rules,
      decimalNumber: toNumberFieldValidation(input, 'decimal').rules,
    }).toMatchObject({
      email: { required: true, email: true },
      accountNumber: { required: true, accountNumber: true },
      iban: { required: true, iban: true },
      organizationNumber: { required: true, organizationNumber: true },
      nationalIdentityNumber: { required: true, nationalIdentityNumber: true },
      postalCode: { required: true, postalCode: true },
      year: { required: true, year: true },
      decimalNumber: { required: true, numberType: 'decimal' },
    });
  });
});
