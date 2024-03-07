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
});
