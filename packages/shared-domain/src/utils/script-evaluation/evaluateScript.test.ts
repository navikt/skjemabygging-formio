import { navFormioUtils } from '../formio';
import { evaluateScript, ScriptArgs } from './evaluateScript';

type ParityCase = { name: string; script: string; args: () => ScriptArgs; ret?: string };

const cases: ParityCase[] = [
  {
    name: 'returns the named variable',
    script: 'value = data.a + 1',
    args: () => ({ data: { a: 1 }, value: 0 }),
    ret: 'value',
  },
  { name: 'returns from the script itself', script: 'return row.b * 2', args: () => ({ data: {}, row: { b: 3 } }) },
  {
    name: 'makes chained lookups null-safe',
    script: 'show = data.a.b.c === undefined',
    args: () => ({ data: {}, show: true }),
    ret: 'show',
  },
  { name: 'returns null on a syntax error', script: 'show = (', args: () => ({ data: {} }), ret: 'show' },
  { name: 'returns null when the script throws', script: 'throw new Error("boom")', args: () => ({ data: {} }) },
  {
    name: 'returns null for a method call on a missing value',
    script: 'return data.a.b.trim()',
    args: () => ({ data: {} }),
  },
  { name: 'leaves form undefined without an instance', script: 'return form', args: () => ({ data: {} }) },
  { name: 'gives form {} when the instance has no root form', script: 'return form', args: () => ({ instance: {} }) },
  {
    name: "uses the instance's root form",
    script: 'return form.title',
    args: () => ({ instance: { root: { _form: { title: 'Root' } } } }),
  },
  { name: 'keeps a given form', script: 'return form.title', args: () => ({ form: { title: 'Given' }, instance: {} }) },
  { name: 'gives form {} when the root is null', script: 'return form', args: () => ({ instance: { root: null } }) },
  {
    name: 'keeps a null root form',
    script: 'return form',
    args: () => ({ instance: { root: { _form: null } } }),
  },
  {
    name: 'calls functions on args',
    script: 'show = instance.isSubmissionDigital() && _.some(data.list, (item) => item === 2)',
    args: () => ({
      data: { list: [1, 2] },
      instance: { isSubmissionDigital: () => true },
      _: { some: (list: number[], predicate: (item: number) => boolean) => list.some(predicate) },
      show: false,
    }),
    ret: 'show',
  },
];

describe('evaluateScript', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(cases)('$name like navFormioUtils.evaluate', ({ script, args, ret }) => {
    expect(evaluateScript(script, args(), ret)).toEqual(navFormioUtils.evaluate(script, args(), ret));
  });

  it('does not change the args it gets', () => {
    const args = { instance: {} };

    evaluateScript('return form', args);

    expect(args).toEqual({ instance: {} });
  });

  it('returns null for a script that is not a string', () => {
    expect(evaluateScript({ and: [true] } as unknown as string, { component: { key: 'field' } })).toBeNull();
  });
});
