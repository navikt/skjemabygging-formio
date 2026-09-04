import { parseSubmissionPath, removeDeepValue, setDeepValue } from './stateHelpers';

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

  it('keeps plain numeric dot segments as object keys', () => {
    expect(parseSubmissionPath('expenses.2024.total')).toEqual(['expenses', '2024', 'total']);
    expect(setDeepValue({}, parseSubmissionPath('expenses.2024.total'), 1000)).toEqual({
      expenses: {
        '2024': {
          total: 1000,
        },
      },
    });
  });
});
