import { Component, NavFormType } from '../../models';
import { getComponentActualValue } from './resolveConditionalValue';
import { ConditionComponent, ConditionData, ConditionInput, ConditionObject, ConditionRow } from './types';

const isObjectLike = (value: ConditionInput): value is ConditionObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOwnKey = (value: ConditionInput, key: string) => isObjectLike(value) && Object.hasOwn(value, key);

const checkSimpleConditional = (
  component: Partial<Component>,
  row: ConditionRow,
  data: ConditionData | undefined,
  form: NavFormType | undefined,
  instance?: ConditionComponent,
) => {
  const condition = component.conditional;

  if (!condition) {
    return true;
  }

  if (!condition.when) {
    return true;
  }

  const value = getComponentActualValue(condition.when, data, row, instance, form);
  const eq = String(condition.eq);
  const show = String(condition.show);

  if (isObjectLike(value) && hasOwnKey(value, String(condition.eq))) {
    return String(value[String(condition.eq)]) === show;
  }

  if (Array.isArray(value) && value.map(String).includes(eq)) {
    return show === 'true';
  }

  return (String(value) === eq) === (show === 'true');
};

const hasUnsupportedConditional = (component: Partial<Component>) => {
  const conditional = component.conditional;
  if (!conditional) {
    return false;
  }

  return Boolean(
    ('json' in conditional && conditional.json) || ('conditions' in conditional && conditional.conditions),
  );
};

export { checkSimpleConditional, hasUnsupportedConditional };
