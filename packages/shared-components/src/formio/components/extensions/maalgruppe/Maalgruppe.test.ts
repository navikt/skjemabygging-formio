import Maalgruppe from './Maalgruppe';

describe('calculateMaalgruppeValue function', () => {
  let maalgruppe;

  beforeEach(() => {
    maalgruppe = new Maalgruppe();
  });

  it('should return maalgruppe if it exists and is not empty', () => {
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
    expect(result).toEqual('someValue');
  });

  it('should return defaultValue if maalgruppe is not set', () => {
    const testData = {
      data: {
        aktivitet: {},
      },
      component: {
        defaultValue: 'defaultValue',
      },
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual('defaultValue');
  });

  it('should return ANNET if neither maalgruppe nor defaultValue is set', () => {
    const testData = {
      data: {
        aktivitet: {},
      },
      component: {},
    };
    const result = maalgruppe.calculateMaalgruppeValue.call(testData);
    expect(result).toEqual('ANNET');
  });
});
