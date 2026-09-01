import { describe, expect, it } from 'vitest';
import { Component, Form, SubmissionData } from '../../models';
import { formPartyAdapter } from './formPartyAdapter';

const FNR = '01010101006';

const form = (components: Partial<Component>[]): Form => ({ components }) as Form;

const yourInformationForm = form([{ key: 'yourInformation', type: 'container', yourInformation: true }]);

const senderForm = form([
  { key: 'yourInformation', type: 'container', yourInformation: true },
  { key: 'sender', type: 'sender', input: true },
]);

const norwegianAddress = {
  borDuINorge: 'ja',
  vegadresseEllerPostboksadresse: 'vegadresse',
  adresse: 'Testveien 1',
  postnummer: '0123',
  bySted: 'Oslo',
};

const getParty = (formDef: Form, data: SubmissionData) => formPartyAdapter.getFormParty(formDef, data);

describe('formPartyAdapter', () => {
  describe('parties the model can express', () => {
    it('reads an identified applicant as sending about themselves', () => {
      expect(getParty(yourInformationForm, { yourInformation: { identitet: { identitetsnummer: FNR } } })).toEqual({
        type: 'party',
        party: { on: 'ownBehalf', person: { type: 'identified', nationalIdentityNumber: FNR } },
      });
    });

    it('keeps the applicant name when the form collected it', () => {
      const result = getParty(yourInformationForm, {
        yourInformation: { fornavn: 'Ada', etternavn: 'Lovelace', identitet: { identitetsnummer: FNR } },
      });
      expect(result).toEqual({
        type: 'party',
        party: {
          on: 'ownBehalf',
          person: { type: 'identified', nationalIdentityNumber: FNR, name: { firstName: 'Ada', surname: 'Lovelace' } },
        },
      });
    });

    it('reads an unidentified applicant as their own sender', () => {
      expect(
        getParty(yourInformationForm, {
          yourInformation: { fornavn: 'Ola', etternavn: 'Nordmann', adresse: norwegianAddress },
        }),
      ).toEqual({
        type: 'party',
        party: {
          on: 'behalfOfOther',
          sender: { type: 'named', name: { firstName: 'Ola', surname: 'Nordmann' } },
          user: {
            type: 'unidentified',
            name: { firstName: 'Ola', surname: 'Nordmann' },
            address: norwegianAddress,
          },
        },
      });
    });

    it('reads a person sender as sending on behalf of another', () => {
      const result = getParty(senderForm, {
        yourInformation: { identitet: { identitetsnummer: FNR } },
        sender: { person: { firstName: 'Ada', surname: 'Lovelace', nationalIdentityNumber: '27054986853' } },
      });
      expect(result).toEqual({
        type: 'party',
        party: {
          on: 'behalfOfOther',
          sender: {
            type: 'identified',
            nationalIdentityNumber: '27054986853',
            name: { firstName: 'Ada', surname: 'Lovelace' },
          },
          user: { type: 'identified', nationalIdentityNumber: FNR },
        },
      });
    });

    it('reads an organization sender as sending on behalf of an organization', () => {
      const result = getParty(senderForm, {
        yourInformation: { identitet: { identitetsnummer: FNR } },
        sender: { organization: { name: 'Nav', number: '889640782' } },
      });
      expect(result).toEqual({
        type: 'party',
        party: {
          on: 'behalfOfOrg',
          organization: { type: 'organization', name: 'Nav', organizationNumber: '889640782' },
          user: { type: 'identified', nationalIdentityNumber: FNR },
        },
      });
    });

    it('passes a foreign address through as submitted', () => {
      const adresse = {
        borDuINorge: 'nei',
        adresse: 'Main street 1',
        bygning: 'B',
        postnummer: 'SW1',
        bySted: 'London',
        region: 'Greater London',
        land: { value: 'GB', label: 'Storbritannia' },
      };
      const result = getParty(yourInformationForm, {
        yourInformation: { fornavn: 'Ola', etternavn: 'Nordmann', adresse },
      });
      expect(result.type === 'party' && result.party.on === 'behalfOfOther' && result.party.user).toEqual({
        type: 'unidentified',
        name: { firstName: 'Ola', surname: 'Nordmann' },
        address: adresse,
      });
    });
  });

  describe('address combinations the model no longer rejects', () => {
    const expectAddress = (adresse: Record<string, unknown>) => {
      const result = getParty(yourInformationForm, {
        yourInformation: { fornavn: 'Ola', etternavn: 'Nordmann', adresse },
      });
      const user = result.type === 'party' && result.party.on === 'behalfOfOther' ? result.party.user : undefined;
      return expect(user?.type === 'unidentified' ? user.address : undefined);
    };

    it('keeps both a street address and a post office box', () => {
      const adresse = { ...norwegianAddress, postboks: 'Postboks 1' };
      expectAddress(adresse).toEqual(adresse);
    });

    it('keeps a foreign post office box', () => {
      const adresse = { borDuINorge: 'nei', postboks: '12', land: { value: 'SE', label: 'Sverige' } };
      expectAddress(adresse).toEqual(adresse);
    });

    it('keeps a foreign address without a street', () => {
      const adresse = { borDuINorge: 'nei', bySted: 'London', land: { value: 'GB', label: 'Storbritannia' } };
      expectAddress(adresse).toEqual(adresse);
    });
  });

  describe('shapes that keep using the legacy mappers', () => {
    it('routes flat applicant fields to the legacy path', () => {
      expect(
        getParty(form([]), { fornavnSoker: 'Ola', etternavnSoker: 'Nordmann', gateadresseSoker: 'Testveien 1' }),
      ).toEqual({
        type: 'legacy',
        reason: 'legacyFields',
      });
    });

    it('routes legacy sender fields to the legacy path', () => {
      expect(
        getParty(yourInformationForm, {
          yourInformation: { identitet: { identitetsnummer: FNR } },
          fornavnAvsender: 'Ada',
          etternavnAvsender: 'Lovelace',
        }),
      ).toEqual({ type: 'legacy', reason: 'legacyFields' });
    });

    it('routes an applicant with neither identification nor address to the legacy path', () => {
      expect(getParty(yourInformationForm, { yourInformation: { fornavn: 'Ola', etternavn: 'Nordmann' } })).toEqual({
        type: 'legacy',
        reason: 'incompleteParty',
      });
    });

    it('routes an unusable identity number to the legacy path', () => {
      expect(
        getParty(yourInformationForm, { yourInformation: { identitet: { identitetsnummer: '12345678911' } } }),
      ).toEqual({ type: 'legacy', reason: 'incompleteParty' });
    });

    it('routes a cover page organization number to the legacy path', () => {
      const formDef = form([{ key: 'orgNr', type: 'orgNr', coverPageUser: true }]);
      expect(getParty(formDef, { orgNr: '889640782' })).toEqual({ type: 'legacy', reason: 'incompleteParty' });
    });
  });
});
