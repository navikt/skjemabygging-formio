import { describe, expect, it } from 'vitest';
import { partyUtils, PartyInput } from './partyUtils';

const FNR = '01010101006';

const errorPaths = (input: PartyInput) => {
  const result = partyUtils.parseParty(input);
  return result.ok ? [] : result.errors.map((error) => `${error.code}:${error.path}`);
};

describe('partyUtils', () => {
  describe('parseParty', () => {
    it('parses someone sending about themselves', () => {
      const result = partyUtils.parseParty({
        yourInformation: { identitet: { identitetsnummer: '010101 01006' } },
      });
      expect(result).toEqual({
        ok: true,
        value: { on: 'ownBehalf', person: { type: 'identified', nationalIdentityNumber: FNR } },
      });
    });

    it('requires identification when sending about yourself', () => {
      expect(errorPaths({ yourInformation: { identitet: { identitetsnummer: '   ' } } })).toEqual([
        'required:person.nationalIdentityNumber',
      ]);
    });

    it('rejects an identity number that is not a national identity number', () => {
      expect(errorPaths({ yourInformation: { identitet: { identitetsnummer: '12345678911' } } })).toEqual([
        'invalid:person.nationalIdentityNumber',
      ]);
    });

    it('accepts synthetic identity numbers only when the caller allows them', () => {
      const input: PartyInput = { yourInformation: { identitet: { identitetsnummer: '30445954957' } } };
      expect(partyUtils.parseParty(input).ok).toBe(false);
      expect(partyUtils.parseParty(input, { allowSyntheticIdentityNumbers: true }).ok).toBe(true);
    });

    it('collects every missing field rather than stopping at the first', () => {
      expect(
        errorPaths({
          sender: { person: { nationalIdentityNumber: '', firstName: '', surname: '' } },
          yourInformation: { adresse: { adresse: 'Gata 1' } },
        }),
      ).toEqual([
        'required:sender.name.firstName',
        'required:sender.name.surname',
        'required:user.name.firstName',
        'required:user.name.surname',
      ]);
    });

    it('parses an unidentified user with a post office box', () => {
      const result = partyUtils.parseParty({
        sender: { person: { nationalIdentityNumber: '', firstName: 'Ada', surname: 'Lovelace' } },
        yourInformation: {
          fornavn: 'Ola',
          etternavn: 'Nordmann',
          adresse: { postboks: 'Postboks 1', postnummer: '0123', bySted: 'Oslo' },
        },
      });
      expect(result.ok).toBe(true);
    });

    it('requires an unidentified user to have an address, but not any field within it', () => {
      const withoutAddress: PartyInput = {
        sender: { person: { nationalIdentityNumber: '', firstName: 'Ada', surname: 'Lovelace' } },
        yourInformation: { fornavn: 'Ola', etternavn: 'Nordmann' },
      };
      expect(errorPaths(withoutAddress)).toEqual(['required:user.address']);
      expect(
        partyUtils.parseParty({
          ...withoutAddress,
          yourInformation: { ...withoutAddress.yourInformation, adresse: {} },
        }).ok,
      ).toBe(true);
    });

    it('accepts address combinations the address component decides on, including both kinds at once', () => {
      const parsed = partyUtils.parseParty({
        sender: { person: { nationalIdentityNumber: '', firstName: 'Ada', surname: 'Lovelace' } },
        yourInformation: {
          fornavn: 'Ola',
          etternavn: 'Nordmann',
          adresse: { adresse: 'Gata 1', postboks: 'Postboks 1', bygning: 'B', land: { value: 'SE', label: 'Sverige' } },
        },
      });
      expect(parsed.ok).toBe(true);
    });

    it('validates the organization number', () => {
      expect(
        errorPaths({
          sender: { organization: { name: 'Nav', number: '123456789' } },
          yourInformation: { identitet: { identitetsnummer: FNR } },
        }),
      ).toEqual(['invalid:organization.organizationNumber']);
    });

    it('parses an organization sending about several people', () => {
      const result = partyUtils.parseParty({
        sender: { organization: { name: 'Nav', number: '889 640 782' } },
        navUnit: { number: '0301' },
      });
      expect(result).toEqual({
        ok: true,
        value: {
          on: 'behalfOfOrg',
          organization: { type: 'organization', name: 'Nav', organizationNumber: '889640782' },
          user: { type: 'severalPeople', navUnit: { number: '0301', name: undefined } },
        },
      });
    });

    it('requires a nav unit for several people', () => {
      expect(
        errorPaths({
          sender: { organization: { name: 'Nav', number: '889640782' } },
          navUnit: {},
        }),
      ).toEqual(['required:user.navUnit.number']);
    });
  });
});
