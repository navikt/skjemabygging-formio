import { removeDeepValue, setDeepValue } from './stateHelpers';

describe('stateHelpers', () => {
  it('sets nested values inside datagrid rows', () => {
    expect(setDeepValue({}, ['grid', 0, 'name'], 'Ada')).toEqual({
      grid: [{ name: 'Ada' }],
    });
  });

  it('removes datagrid rows by index', () => {
    expect(removeDeepValue({ grid: [{ name: 'Ada' }, { name: 'Bob' }] }, ['grid', 0])).toEqual({
      grid: [{ name: 'Bob' }],
    });
  });
});
