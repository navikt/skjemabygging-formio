import Maalgruppe from './Maalgruppe';

describe('calculateMaalgruppeValue function', () => {
  let maalgruppe;

  beforeEach(() => {
    maalgruppe = new Maalgruppe(undefined, {}, {});
  });

  const prefilled = {
    maalgruppetype: 'defaultValue',
    maalgruppenavn: 'default name',
    gyldighetsperiode: { fom: '2024-01-01', tom: '2025-01-01' },
  };

  const maalgruppeAnnet = { maalgruppetype: 'ANNET' };

  it('should return ANNET if maalgruppe is not set on activity', () => {
    const testData = {
      data: {
        aktivitet: {},
      },
      component: {
        defaultValue: prefilled,
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({
      calculated: maalgruppeAnnet,
      prefilled,
    });
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
        defaultValue: prefilled,
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: maalgruppeAnnet, prefilled: prefilled });
  });

  it('should return ANNET if neither maalgruppe nor defaultValue is set', () => {
    const testData = {
      data: {
        aktivitet: {},
      },
      component: {},
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual({ calculated: maalgruppeAnnet, prefilled: undefined });
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
    expect(result).toEqual({ calculated: { maalgruppetype: 'MOTDAGPEN' }, prefilled: undefined });
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
    expect(result).toEqual({ calculated: { maalgruppetype: 'ENSFORUTD' }, prefilled: undefined });
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
    expect(result).toEqual({ calculated: { maalgruppetype: 'ENSFORUTD' }, prefilled: undefined });
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
    expect(result).toEqual({ calculated: { maalgruppetype: 'ANNET' }, prefilled: undefined });
  });
});
