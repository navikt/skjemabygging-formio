import { legacyFlatPersonalInfoUtils } from './legacyFlatPersonalInfoUtils';

describe('legacyFlatPersonalInfoUtils', () => {
  describe('getConcernedUser', () => {
    it('resolves an identified user', () => {
      expect(
        legacyFlatPersonalInfoUtils.getConcernedUser({
          fodselsnummerDNummerSoker: '123 456 789 11',
        }),
      ).toEqual({
        kind: 'identified-person',
        nationalIdentityNumber: '123 456 789 11',
      });
    });

    it('returns undefined when all legacy values are empty', () => {
      expect(
        legacyFlatPersonalInfoUtils.getConcernedUser({
          fodselsnummerDNummerSoker: ' ',
          fornavnSoker: '',
          poststedSoker: '  ',
          norskVegadresse: {
            vegadresseSoker: '',
            postnrSoker: '',
          },
        }),
      ).toBeUndefined();
    });

    it('returns undefined when legacy address data has no name', () => {
      expect(
        legacyFlatPersonalInfoUtils.getConcernedUser({
          gateadresseSoker: 'Testveien 1',
          postnummerSoker: '0101',
          poststedSoker: 'Oslo',
        }),
      ).toBeUndefined();
    });

    it('resolves an unidentified user from flat fields', () => {
      expect(
        legacyFlatPersonalInfoUtils.getConcernedUser({
          fornavnSoker: 'Legacy',
          etternavnSoker: 'User',
          coSoker: 'c/o Receiver',
          gateadresseSoker: 'Testveien 1',
          postnummerSoker: '0101',
          poststedSoker: 'Oslo',
          landSoker: 'Norge',
        }),
      ).toEqual({
        kind: 'unidentified-person',
        firstName: 'Legacy',
        surname: 'User',
        address: expect.objectContaining({
          co: 'c/o Receiver',
          streetAddress: 'Testveien 1',
          postalCode: '0101',
          postalName: 'Oslo',
          country: { value: 'Norge', label: 'Norge' },
        }),
      });
    });
  });

  describe('mapAddress', () => {
    it('prefers a nested Norwegian street address over flat fields', () => {
      expect(
        legacyFlatPersonalInfoUtils.mapAddress({
          coSoker: 'Flat receiver',
          gateadresseSoker: 'Flat street',
          postnrSoker: '1111',
          poststedSoker: 'Flat town',
          norskVegadresse: {
            coSoker: 'Nested receiver',
            vegadresseSoker: 'Nested street',
            postnrSoker: '2222',
            poststedSoker: 'Nested town',
          },
        }),
      ).toEqual({
        co: 'Nested receiver',
        postOfficeBox: undefined,
        streetAddress: 'Nested street',
        building: undefined,
        postalCode: '2222',
        postalName: 'Nested town',
        region: undefined,
        country: { value: 'Norge', label: 'Norge' },
      });
    });

    it('maps a Norwegian post office box address', () => {
      expect(
        legacyFlatPersonalInfoUtils.mapAddress({
          norskPostboksadresse: {
            postboksNrSoker: '123',
            postnrSoker: '0101',
            poststedSoker: 'Oslo',
          },
        }),
      ).toEqual(
        expect.objectContaining({
          co: undefined,
          postOfficeBox: 'Postboks 123',
          postalCode: '0101',
          postalName: 'Oslo',
          country: { value: 'Norge', label: 'Norge' },
        }),
      );
    });

    it('maps a foreign address', () => {
      expect(
        legacyFlatPersonalInfoUtils.mapAddress({
          utenlandskAdresse: {
            coSoker: 'c/o Receiver',
            postboksNrSoker: 'PO 42',
            bygningSoker: 'Building A',
            postkodeSoker: 'SW1A 1AA',
            poststedSoker: 'London',
            landSoker: 'Storbritannia',
            regionSoker: 'Greater London',
          },
        }),
      ).toEqual({
        co: 'c/o Receiver',
        postOfficeBox: 'PO 42',
        streetAddress: undefined,
        building: 'Building A',
        postalCode: 'SW1A 1AA',
        postalName: 'London',
        region: 'Greater London',
        country: { value: 'Storbritannia', label: 'Storbritannia' },
      });
    });
  });
});
