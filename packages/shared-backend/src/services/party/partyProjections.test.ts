import { Party } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { partyProjections } from './partyProjections';

const FNR = '01010101006';

describe('partyProjections', () => {
  describe('toSubmissionParties', () => {
    it('sends only the user when someone sends about themselves', () => {
      const party: Party = { on: 'ownBehalf', person: { type: 'identified', nationalIdentityNumber: FNR } };
      expect(partyProjections.toSubmissionParties(party)).toEqual({ bruker: FNR });
    });

    it('sends the person filling in as sender', () => {
      const party: Party = {
        on: 'behalfOfOther',
        sender: {
          type: 'identified',
          nationalIdentityNumber: '27054986853',
          name: { firstName: 'Ada', surname: 'Lovelace' },
        },
        user: { type: 'identified', nationalIdentityNumber: FNR },
      };
      expect(partyProjections.toSubmissionParties(party)).toEqual({
        bruker: FNR,
        avsender: { idType: 'FNR', id: '27054986853', navn: 'Ada Lovelace' },
      });
    });

    it('sends a named sender without an identity number', () => {
      const party: Party = {
        on: 'behalfOfOther',
        sender: { type: 'named', name: { firstName: 'Ola', surname: 'Nordmann' } },
        user: {
          type: 'unidentified',
          name: { firstName: 'Ola', surname: 'Nordmann' },
          address: { adresse: 'Testveien 1', postnummer: '0123', bySted: 'Oslo' },
        },
      };
      expect(partyProjections.toSubmissionParties(party)).toEqual({ avsender: { navn: 'Ola Nordmann' } });
    });

    it('sends the organization as sender', () => {
      const party: Party = {
        on: 'behalfOfOrg',
        organization: { type: 'organization', name: 'Nav', organizationNumber: '889640782' },
        user: { type: 'identified', nationalIdentityNumber: FNR },
      };
      expect(partyProjections.toSubmissionParties(party)).toEqual({
        bruker: FNR,
        avsender: { idType: 'ORGNR', id: '889640782', navn: 'Nav' },
      });
    });
  });

  describe('toCoverPageParties', () => {
    it('identifies the user by identity number', () => {
      const party: Party = { on: 'ownBehalf', person: { type: 'identified', nationalIdentityNumber: FNR } };
      expect(partyProjections.toCoverPageParties(party)).toEqual({ user: { nationalIdentityNumber: FNR } });
    });

    it('describes an unidentified user by name and post office box', () => {
      const party: Party = {
        on: 'behalfOfOther',
        sender: { type: 'named', name: { firstName: 'Ola', surname: 'Nordmann' } },
        user: {
          type: 'unidentified',
          name: { firstName: 'Ola', surname: 'Nordmann' },
          address: { co: 'Kari', postboks: 'Postboks 1', postnummer: '0123', bySted: 'Oslo' },
        },
      };
      expect(partyProjections.toCoverPageParties(party)).toEqual({
        user: {
          firstName: 'Ola',
          surname: 'Nordmann',
          address: {
            co: 'Kari',
            streetAddress: undefined,
            postOfficeBox: 'Postboks 1',
            building: undefined,
            postalCode: '0123',
            postalName: 'Oslo',
            region: undefined,
            country: undefined,
          },
        },
      });
    });

    it('describes a foreign address with its country', () => {
      const party: Party = {
        on: 'behalfOfOther',
        sender: { type: 'named', name: { firstName: 'Ola', surname: 'Nordmann' } },
        user: {
          type: 'unidentified',
          name: { firstName: 'Ola', surname: 'Nordmann' },
          address: { adresse: 'Main street 1', bySted: 'London', land: { value: 'GB', label: 'Storbritannia' } },
        },
      };
      expect(partyProjections.toCoverPageParties(party)).toEqual({
        user: {
          firstName: 'Ola',
          surname: 'Nordmann',
          address: {
            co: undefined,
            streetAddress: 'Main street 1',
            postOfficeBox: undefined,
            building: undefined,
            postalCode: undefined,
            postalName: 'London',
            region: undefined,
            country: { value: 'GB', label: 'Storbritannia' },
          },
        },
      });
    });

    it('addresses the nav unit when the submission concerns several people', () => {
      const party: Party = {
        on: 'behalfOfOrg',
        organization: { type: 'organization', name: 'Nav', organizationNumber: '889640782' },
        user: { type: 'severalPeople', navUnit: { number: '0301' } },
      };
      expect(partyProjections.toCoverPageParties(party)).toEqual({ recipient: { navUnit: '0301' } });
    });
  });
});
