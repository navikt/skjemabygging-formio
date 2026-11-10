import { isSameSubmissionValue, parseSubmissionPath, removeDeepValue, setDeepValue } from './stateHelpers';

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

  it.each([
    ['equal primitives', 'value', 'value', true],
    ['different primitives', 'value', 'other', false],
    ['equal nested objects', { person: { name: 'Ada' } }, { person: { name: 'Ada' } }, true],
    ['different key counts', { name: 'Ada' }, { name: 'Ada', age: 36 }, false],
    ['equal arrays', [{ value: 1 }, 2], [{ value: 1 }, 2], true],
    ['different arrays', [1, 2], [2, 1], false],
    ['null and object', null, {}, false],
  ])('compares submission values: %s', (_caseName, source, target, expected) => {
    expect(isSameSubmissionValue(source, target)).toBe(expected);
  });
});
