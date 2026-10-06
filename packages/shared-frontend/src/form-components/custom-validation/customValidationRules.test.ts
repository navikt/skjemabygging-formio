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

const fromDateComponent = { key: 'from', type: 'navDatepicker', input: true } as Component;
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
  it.each([
    { name: 'notEqual', component: notEqualComponent, dependencyPath: 'first', dependencyValue: 'same' },
    { name: 'datePeriod', component: toDateComponent, dependencyPath: 'from', dependencyValue: '2026-01-10' },
  ])('$name rules only read the dependency path', ({ component, dependencyPath, dependencyValue }) => {
    const formComponents = [notEqualComponent, fromDateComponent, toDateComponent];
    const onlyDependency: Submission = { data: { [dependencyPath]: dependencyValue } };
    const fullRules = resolveCustomValidationRules(component, { submission: fullSubmission, formComponents });

    expect(getCustomValidationDependencyPath(component, formComponents)).toBe(dependencyPath);
    expect(fullRules).not.toEqual({});
    expect(resolveCustomValidationRules(component, { submission: onlyDependency, formComponents })).toEqual(fullRules);
  });

  it('has no dependency without recognized custom rules', () => {
    expect(getCustomValidationDependencyPath(fromDateComponent, [fromDateComponent])).toBeUndefined();
  });
});
