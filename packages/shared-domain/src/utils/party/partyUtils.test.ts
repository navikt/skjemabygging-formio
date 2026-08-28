import { describe, expect, it } from 'vitest';
import { PartyInput } from '../../models';
import { partyUtils } from './partyUtils';

const personFillingIn = {
  type: 'person' as const,
  firstName: 'Ada',
  surname: 'Lovelace',
  nationalIdentityNumber: '010101 01006',
};
const organization = {
  type: 'organization' as const,
  name: 'Example AS',
  organizationNumber: '889 640 782',
};
const identified = { type: 'identified' as const, nationalIdentityNumber: '010101 01006' };
const unidentified = {
  type: 'unidentified' as const,
  firstName: '  Ola',
  surname: 'Nordmann  ',
  address: {
    type: 'norwegianStreet' as const,
    street: '  Testveien 1',
    postalCode: '0123',
    postalName: 'Oslo  ',
  },
};

const validInputs: PartyInput[] = [
  {
    relationship: 'self',
    personFillingIn,
    responsibleSender: personFillingIn,
    concernedUser: identified,
  },
  {
    relationship: 'anotherPerson',
    personFillingIn,
    responsibleSender: personFillingIn,
    concernedUser: identified,
  },
  {
    relationship: 'anotherPerson',
    personFillingIn,
    responsibleSender: personFillingIn,
    concernedUser: unidentified,
  },
  {
    relationship: 'organization',
    personFillingIn,
    responsibleSender: organization,
    concernedUser: identified,
  },
  {
    relationship: 'organization',
    personFillingIn,
    responsibleSender: organization,
    concernedUser: unidentified,
  },
  {
    relationship: 'organization',
    personFillingIn,
    responsibleSender: organization,
    concernedUser: { type: 'severalPeople' },
    navUnit: { number: '1234', name: 'NAV Test' },
  },
];

describe('partyUtils', () => {
  describe('validateParty', () => {
    it.each(validInputs)('accepts an approved party combination', (input) => {
      expect(partyUtils.validateParty(input).success).toBe(true);
    });

    it('normalizes identifiers and blank optional values while preserving display text', () => {
      const result = partyUtils.validateParty(validInputs[4]);
      expect(result).toEqual({
        success: true,
        data: {
          relationship: 'organization',
          personFillingIn: {
            ...personFillingIn,
            nationalIdentityNumber: '01010101006',
          },
          responsibleSender: {
            ...organization,
            organizationNumber: '889640782',
          },
          concernedUser: {
            ...unidentified,
            address: {
              ...unidentified.address,
            },
          },
        },
      });
    });

    it('returns all field-addressable errors for incomplete data', () => {
      expect(
        partyUtils.validateParty({
          relationship: 'organization',
          personFillingIn: { type: 'person' },
          responsibleSender: { type: 'organization', name: ' ', organizationNumber: '123' },
          concernedUser: {
            type: 'unidentified',
            address: { type: 'foreign', country: {} },
          },
        }),
      ).toEqual({
        success: false,
        errors: [
          { code: 'required', path: 'personFillingIn.firstName' },
          { code: 'required', path: 'personFillingIn.surname' },
          { code: 'required', path: 'responsibleSender.name' },
          { code: 'invalid', path: 'responsibleSender.organizationNumber' },
          { code: 'required', path: 'concernedUser.firstName' },
          { code: 'required', path: 'concernedUser.surname' },
          { code: 'required', path: 'concernedUser.address.street' },
          { code: 'required', path: 'concernedUser.address.country.name' },
        ],
      });
    });

    it('rejects conflicting relationship data and routing', () => {
      const result = partyUtils.validateParty({
        relationship: 'anotherPerson',
        personFillingIn,
        responsibleSender: organization,
        concernedUser: { type: 'severalPeople' },
        navUnit: { number: '1234' },
      });
      expect(result).toEqual({
        success: false,
        errors: expect.arrayContaining([
          { code: 'invalid', path: 'responsibleSender' },
          { code: 'invalid', path: 'concernedUser' },
          { code: 'notAllowed', path: 'navUnit' },
        ]),
      });
    });

    it('requires the self user to match the person filling in', () => {
      const result = partyUtils.validateParty({
        ...validInputs[0],
        concernedUser: { type: 'identified', nationalIdentityNumber: '020202 01056' },
      });
      expect(result).toEqual({
        success: false,
        errors: [{ code: 'mismatch', path: 'concernedUser.nationalIdentityNumber' }],
      });
    });
  });

  it('resolves semantic roles and display sections from validated data', () => {
    const result = partyUtils.validateParty(validInputs[5]);
    if (!result.success) {
      throw new Error('Expected valid test data');
    }

    expect(partyUtils.resolvePartyRoles(result.data)).toEqual(result.data);
    expect(partyUtils.toPartyDisplayData(result.data)).toEqual({
      relationship: 'organization',
      personFillingIn: result.data.personFillingIn,
      responsibleOrganization: result.data.responsibleSender,
      concernedUser: result.data.concernedUser,
      navUnit: result.data.navUnit,
    });
  });
});
