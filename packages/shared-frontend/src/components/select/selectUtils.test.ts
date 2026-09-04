import { describe, expect, it } from 'vitest';
import { COMBOBOX_THRESHOLD, resolveRenderedSelectType } from './selectUtils';

describe('resolveRenderedSelectType', () => {
  it('renders select below the combobox threshold in auto mode', () => {
    expect(resolveRenderedSelectType('auto', COMBOBOX_THRESHOLD - 1)).toBe('select');
  });

  it('renders combobox at the combobox threshold in auto mode', () => {
    expect(resolveRenderedSelectType('auto', COMBOBOX_THRESHOLD)).toBe('combobox');
  });

  it('keeps an explicit rendered type', () => {
    expect(resolveRenderedSelectType('select', COMBOBOX_THRESHOLD)).toBe('select');
    expect(resolveRenderedSelectType('combobox', 1)).toBe('combobox');
  });
});
