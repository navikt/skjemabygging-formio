import { vi } from 'vitest';
import type { Component } from '../../../models';
import { checkCondition, createComponent, createForm } from './testUtils';

describe('checkCondition orchestration', () => {
  it('returns true by default when a component has no conditional', () => {
    const component = createComponent({ key: 'plainField' });
    const form = createForm([component]);

    expect(checkCondition(component, undefined, {}, form)).toBe(true);
  });

  it('returns true when a placeholder conditional has no when value', () => {
    const component = createComponent({
      key: 'placeholderConditional',
      conditional: {
        show: '',
        when: '',
        eq: '',
        json: '',
      } as unknown as Component['conditional'],
    });
    const form = createForm([component]);

    expect(checkCondition(component, undefined, {}, form)).toBe(true);
  });

  it('warns and treats components with unsupported json conditionals as visible', () => {
    const component = createComponent({
      key: 'jsonConditional',
      conditional: {
        show: true,
        when: 'hasDetails',
        eq: 'ja',
        json: { and: [] },
      },
    });
    const form = createForm([component]);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(checkCondition(component, undefined, { hasDetails: 'nei' }, form)).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      'Unsupported conditional type on component "jsonConditional". Treating as visible.',
    );

    warnSpy.mockRestore();
  });

  it('warns and treats components with unsupported conditions arrays as visible', () => {
    const component = createComponent({
      key: 'conditionsConditional',
      conditional: {
        show: true,
        when: 'hasDetails',
        eq: 'ja',
        conditions: [{ component: 'hasDetails' }],
      } as unknown as {
        show: boolean;
        when: string;
        eq: string;
        conditions: Array<Record<string, unknown>>;
      },
    });
    const form = createForm([component]);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(checkCondition(component, undefined, { hasDetails: 'nei' }, form)).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      'Unsupported conditional type on component "conditionsConditional". Treating as visible.',
    );

    warnSpy.mockRestore();
  });
});
