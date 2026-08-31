import { describe, expect, it } from 'vitest';
import { PartyDraft } from '../../models';
import { partyUtils } from './partyUtils';

const FNR = '01010101006';

const errorPaths = (draft: PartyDraft) => {
  const result = partyUtils.parseParty(draft);
  return result.ok ? [] : result.errors.map((error) => `${error.code}:${error.path}`);
};

describe('partyUtils', () => {
  describe('parseParty', () => {
    it('reports a missing party', () => {
      expect(errorPaths(undefined as unknown as PartyDraft)).toEqual(['required:on']);
    });

    it('parses someone sending about themselves', () => {
      const result = partyUtils.parseParty({
        on: 'ownBehalf',
        person: { type: 'identified', nationalIdentityNumber: '010101 01006' },
      });
      expect(result).toEqual({
        ok: true,
        value: { on: 'ownBehalf', person: { type: 'identified', nationalIdentityNumber: FNR } },
      });
    });

    it('requires identification when sending about yourself', () => {
      expect(errorPaths({ on: 'ownBehalf', person: { type: 'identified' } })).toEqual([
        'required:person.nationalIdentityNumber',
      ]);
    });

    it('rejects an identity number that is not a national identity number', () => {
      expect(
        errorPaths({ on: 'ownBehalf', person: { type: 'identified', nationalIdentityNumber: '12345678911' } }),
      ).toEqual(['invalid:person.nationalIdentityNumber']);
    });

    it('accepts synthetic identity numbers only when the caller allows them', () => {
      const draft: PartyDraft = {
        on: 'ownBehalf',
        person: { type: 'identified', nationalIdentityNumber: '30445954957' },
      };
      expect(partyUtils.parseParty(draft).ok).toBe(false);
      expect(partyUtils.parseParty(draft, { allowSyntheticIdentityNumbers: true }).ok).toBe(true);
    });

    it('collects every missing field rather than stopping at the first', () => {
      expect(
        errorPaths({
          on: 'behalfOfOther',
          sender: { type: 'named', name: {} },
          user: { type: 'unidentified', name: {}, address: { adresse: 'Gata 1' } },
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
        on: 'behalfOfOther',
        sender: { type: 'named', name: { firstName: 'Ada', surname: 'Lovelace' } },
        user: {
          type: 'unidentified',
          name: { firstName: 'Ola', surname: 'Nordmann' },
          address: { postboks: 'Postboks 1', postnummer: '0123', bySted: 'Oslo' },
        },
      });
      expect(result.ok).toBe(true);
    });

    it('requires an unidentified user to have an address, but not any field within it', () => {
      const withoutAddress = {
        on: 'behalfOfOther' as const,
        sender: { type: 'named' as const, name: { firstName: 'Ada', surname: 'Lovelace' } },
        user: { type: 'unidentified' as const, name: { firstName: 'Ola', surname: 'Nordmann' } },
      };
      expect(errorPaths(withoutAddress)).toEqual(['required:user.address']);
      expect(partyUtils.parseParty({ ...withoutAddress, user: { ...withoutAddress.user, address: {} } }).ok).toBe(true);
    });

    it('accepts address combinations the address component decides on, including both kinds at once', () => {
      const parsed = partyUtils.parseParty({
        on: 'behalfOfOther',
        sender: { type: 'named', name: { firstName: 'Ada', surname: 'Lovelace' } },
        user: {
          type: 'unidentified',
          name: { firstName: 'Ola', surname: 'Nordmann' },
          address: { adresse: 'Gata 1', postboks: 'Postboks 1', bygning: 'B', land: { value: 'SE', label: 'Sverige' } },
        },
      });
      expect(parsed.ok).toBe(true);
    });

    it('validates the organization number', () => {
      expect(
        errorPaths({
          on: 'behalfOfOrg',
          organization: { name: 'Nav', organizationNumber: '123456789' },
          user: { type: 'identified', nationalIdentityNumber: FNR },
        }),
      ).toEqual(['invalid:organization.organizationNumber']);
    });

    it('parses an organization sending about several people', () => {
      const result = partyUtils.parseParty({
        on: 'behalfOfOrg',
        organization: { name: 'Nav', organizationNumber: '889 640 782' },
        user: { type: 'severalPeople', navUnit: { number: '0301' } },
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
          on: 'behalfOfOrg',
          organization: { name: 'Nav', organizationNumber: '889640782' },
          user: { type: 'severalPeople' },
        }),
      ).toEqual(['required:user.navUnit.number']);
    });
  });
});
