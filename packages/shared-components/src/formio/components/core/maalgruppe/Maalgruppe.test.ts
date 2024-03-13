import Maalgruppe from './Maalgruppe';

describe('calculateMaalgruppeValue function', () => {
  let maalgruppe;

  beforeEach(() => {
    maalgruppe = new Maalgruppe(undefined, {}, {});
  });

  it('should return maalgruppe from activity if it exists', () => {
    const testData = {
      data: {
        aktivitet: {
          maalgruppe: 'someValue',
        },
      },
      component: {
        defaultValue: 'defaultValue',
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'someValue', prefilled: 'defaultValue' });
  });

  it('should return ANNET if maalgruppe is not set on activity', () => {
    const testData = {
      data: {
        aktivitet: {},
      },
      component: {
        defaultValue: 'defaultValue',
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'ANNET', prefilled: 'defaultValue' });
  });

  it('should return ANNET if default activity is chosen', () => {
    const testData = {
      data: {
        aktivitet: {
          aktivitetId: 'ingenAktivitet',
          maalgruppe: '',
          periode: { fom: '', tom: '' },
          text: '',
        },
      },
      component: {
        defaultValue: 'defaultValue',
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'ANNET', prefilled: 'defaultValue' });
  });

  it('should return ANNET if neither maalgruppe nor defaultValue is set', () => {
    const testData = {
      data: {
        aktivitet: {},
      },
      component: {},
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'ANNET', prefilled: undefined });
  });

  it('should return maalgruppe, if selected in Din Situasjon', () => {
    const testData = {
      root: {
        data: {
          dagpenger: true,
        },
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'MOTDAGPEN', prefilled: undefined });
  });

  it('should return maalgruppe based on priority, if multiple selected in Din Situasjon', () => {
    const testData = {
      root: {
        data: {
          ensligUtdanning: true,
          gjenlevendeUtdanning: true,
          dagpenger: true,
          annet: true,
        },
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'ENSFORUTD', prefilled: undefined });
  });

  it('should accept "ja", as well as true, but not "truthy" values', () => {
    const testData = {
      root: {
        data: {
          aapUforeNedsattArbEvne: 'qwerty',
          ensligUtdanning: 'ja',
          ensligArbSoker: true,
        },
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'ENSFORUTD', prefilled: undefined });
  });

  it('should return ANNET, if nothing is selected in Din Situasjon', () => {
    const testData = {
      root: {
        data: {
          aapUforeNedsattArbEvne: false,
          ensligUtdanning: false,
          ensligArbSoker: false,
          tidligereFamiliepleier: false,
          gjenlevendeUtdanning: false,
          gjenlevendeArbSoker: false,
          tiltakspenger: false,
          dagpenger: false,
          regArbSoker: false,
          annet: false,
        },
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: 'ANNET', prefilled: undefined });
  });
});
