import { Component, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { getCustomValidationDependencyPath, resolveCustomValidationRules } from './customValidationRules';

const datePeriodScript = [
  'var startday = new Date(row.from);',
  'var endday = new Date(row.to);',
  'var diffInTime = endday.getTime() - startday.getTime();',
  'var diffInDays = diffInTime / (1000 * 3600 * 24);',
  "if (endday <= startday) { valid = ((endday > startday) ? true : 'After start'); }",
  "else { if (diffInDays > 30) { valid = ((diffInDays <= 30) ? true : 'Too long'); } }",
].join(' ');

const notEqualComponent = {
  key: 'second',
  type: 'textfield',
  input: true,
  validate: { custom: "valid = (input !== data.first) ? true : 'Must differ'" },
} as Component;

const toDateComponent = {
  key: 'to',
  type: 'navDatepicker',
  input: true,
  beforeDateInputKey: 'from',
  validate: { custom: datePeriodScript },
} as Component;

const fullSubmission: Submission = {
  data: { first: 'same', second: 'other', from: '2026-01-10', to: '2026-01-05', unrelated: 'value' },
};

describe('getCustomValidationDependencyPath', () => {
  it('notEqual rules only read the dependency path', () => {
    const onlyDependency: Submission = { data: { first: 'same' } };
    const fullRules = resolveCustomValidationRules(notEqualComponent, { submission: fullSubmission });

    expect(getCustomValidationDependencyPath(notEqualComponent)).toBe('first');
    expect(fullRules).not.toEqual({});
    expect(resolveCustomValidationRules(notEqualComponent, { submission: onlyDependency })).toEqual(fullRules);
  });

  it('ignores a date picker script, which the old renderer never ran', () => {
    expect(getCustomValidationDependencyPath(toDateComponent)).toBeUndefined();
    expect(resolveCustomValidationRules(toDateComponent, { submission: fullSubmission })).toEqual({});
  });
});
