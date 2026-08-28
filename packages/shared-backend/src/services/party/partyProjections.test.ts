import { PartyData } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { partyProjections } from './partyProjections';

const person = {
  type: 'person' as const,
  firstName: 'Ada',
  surname: 'Lovelace',
  nationalIdentityNumber: '01010101006',
};
const identified = { type: 'identified' as const, nationalIdentityNumber: '02020201056' };
const organization = {
  type: 'organization' as const,
  name: 'Example AS',
  organizationNumber: '889640782',
};
const party = (overrides: Partial<PartyData> = {}): PartyData => ({
  relationship: 'anotherPerson',
  personFillingIn: person,
  responsibleSender: person,
  concernedUser: identified,
  ...overrides,
});

describe('partyProjections', () => {
  describe('toSubmissionParties', () => {
    it.each([
      [
        party({
          relationship: 'self',
          concernedUser: { type: 'identified', nationalIdentityNumber: person.nationalIdentityNumber },
        }),
        { bruker: person.nationalIdentityNumber },
      ],
      [
        party(),
        {
          bruker: identified.nationalIdentityNumber,
          avsender: {
            idType: 'FNR',
            id: person.nationalIdentityNumber,
            navn: 'Ada Lovelace',
          },
        },
      ],
      [
        party({
          concernedUser: {
            type: 'unidentified',
            firstName: 'Ola',
            surname: 'Nordmann',
            address: {
              type: 'norwegianStreet',
              street: 'Testveien 1',
              postalCode: '0123',
              postalName: 'Oslo',
            },
          },
        }),
        {
          avsender: {
            idType: 'FNR',
            id: person.nationalIdentityNumber,
            navn: 'Ada Lovelace',
          },
        },
      ],
      [
        party({ relationship: 'organization', responsibleSender: organization }),
        {
          bruker: identified.nationalIdentityNumber,
          avsender: {
            idType: 'ORGNR',
            id: organization.organizationNumber,
            navn: organization.name,
          },
        },
      ],
      [
        party({
          relationship: 'organization',
          responsibleSender: organization,
          concernedUser: {
            type: 'unidentified',
            firstName: 'Ola',
            surname: 'Nordmann',
            address: {
              type: 'foreign',
              street: 'Main Street 1',
              country: { code: 'SE', name: 'Sverige' },
            },
          },
        }),
        {
          avsender: {
            idType: 'ORGNR',
            id: organization.organizationNumber,
            navn: organization.name,
          },
        },
      ],
      [
        party({
          relationship: 'organization',
          responsibleSender: organization,
          concernedUser: { type: 'severalPeople' },
          navUnit: { number: '1234' },
        }),
        {
          avsender: {
            idType: 'ORGNR',
            id: organization.organizationNumber,
            navn: organization.name,
          },
        },
      ],
    ] as const)('maps an approved combination', (input, expected) => {
      expect(partyProjections.toSubmissionParties(input)).toEqual(expected);
    });
  });

  describe('toCoverPageParties', () => {
    it('maps an identified concerned user', () => {
      expect(partyProjections.toCoverPageParties(party())).toEqual({
        user: { nationalIdentityNumber: identified.nationalIdentityNumber },
      });
    });

    it('maps an unidentified concerned user and address', () => {
      expect(
        partyProjections.toCoverPageParties(
          party({
            concernedUser: {
              type: 'unidentified',
              firstName: 'Ola',
              surname: 'Nordmann',
              address: {
                type: 'norwegianPostOfficeBox',
                co: 'Kari Nordmann',
                postOfficeBox: '123',
                postalCode: '0123',
                postalName: 'Oslo',
              },
            },
          }),
        ),
      ).toEqual({
        user: {
          firstName: 'Ola',
          surname: 'Nordmann',
          address: {
            co: 'Kari Nordmann',
            postOfficeBox: '123',
            postalCode: '0123',
            postalName: 'Oslo',
          },
        },
      });
    });

    it('maps several people to NAV-unit routing without a user', () => {
      expect(
        partyProjections.toCoverPageParties(
          party({
            relationship: 'organization',
            responsibleSender: organization,
            concernedUser: { type: 'severalPeople' },
            navUnit: { number: '1234' },
          }),
        ),
      ).toEqual({ recipient: { navUnit: '1234' } });
    });

    it('rejects unsafe cover-page text without including the value in the error', () => {
      const invalidParty = party({
        concernedUser: {
          type: 'unidentified',
          firstName: 'Ola=',
          surname: 'Nordmann',
          address: {
            type: 'foreign',
            street: 'Main Street 1',
            country: { name: 'Sverige' },
          },
        },
      });
      expect(() => partyProjections.toCoverPageParties(invalidParty)).toThrowError(
        'Invalid party value for cover page',
      );
    });
  });
});
