import stringUtils from "./stringUtils";

describe('stringUtils', () => {

  describe('camelCase', () => {

    it('transforms text to camel case', () => {
      expect(stringUtils.camelCase('Dette skal bli camel case')).toEqual('detteSkalBliCamelCase');
    });

    it('removes characters which are not letters or numbers', () => {
      expect(stringUtils.camelCase('NAV 20-12.33')).toEqual('nav201233');
    });

    it('replaces the norwegian special characters', () => {
      expect(stringUtils.camelCase('Dårlig vær på østlandet')).toEqual('darligVaerPaOstlandet');
      expect(stringUtils.camelCase('Svada årelang ønskebrønn ærefull')).toEqual('svadaArelangOnskebronnAerefull');
      expect(stringUtils.camelCase('ÆØÅ')).toEqual('aeoa');
      expect(stringUtils.camelCase('ÆØÅ ÆØÅ')).toEqual('aeoaAeoa');
    });

  });

});
