import { navFormioUtils } from '../formio';
import { getValueByKey } from './getValueByKey';

const submission = {
  data: {
    top: 'top value',
    empty: '',
    zero: 0,
    unchecked: false,
    nothing: null,
    'dotted.key': 'literal',
    container: {
      nested: 'nested value',
      inner: { deep: 'deep value', zero: 'not reached' },
      nothing: 'nested after null',
    },
    second: { nested: 'second nested value', unique: 'unique value' },
    datagrid: [{ inGrid: 'grid value' }],
    paths: { '': { a: 'empty segment' }, b: { '': { c: 'double dot' } }, end: { '': 'trailing dot' } },
    'with-hyphen': 'hyphen value',
    hyphen: { 'in-path': 'hyphen path value' },
    list: ['first', 'second'],
    instance: new (class Example {
      inInstance = 'class value';
    })(),
    nullPrototype: Object.assign(Object.create(null), { inNullPrototype: 'null prototype value' }),
    numbered: { 5: 'number key value' },
  },
};

const keys = [
  'top',
  'empty',
  'zero',
  'unchecked',
  'nothing',
  'dotted.key',
  'nested',
  'deep',
  'unique',
  'container.inner.deep',
  'inner.deep',
  'datagrid.0.inGrid',
  'inGrid',
  'missing',
  '',
  'constructor',
  '.a',
  'b..c',
  'end.',
  'with-hyphen',
  'hyphen.in-path',
  'list.1',
  'list.5',
  'list.length',
  'top.length',
  'inInstance',
  'inNullPrototype',
];

describe('getValueByKey', () => {
  it.each(keys)('finds "%s" like navFormioUtils.getValue', (key) => {
    expect(getValueByKey(submission, key)).toEqual(navFormioUtils.getValue(submission, key));
  });

  it.each([undefined, null, 5])('finds non-string key %s like navFormioUtils.getValue', (key) => {
    const actual = getValueByKey(submission, key as unknown as string);

    expect(actual).toEqual(navFormioUtils.getValue(submission, key as unknown as string));
  });

  it('returns null without submission data', () => {
    expect(getValueByKey({}, 'top')).toBeNull();
  });
});
