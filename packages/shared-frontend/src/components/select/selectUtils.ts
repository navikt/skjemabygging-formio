import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';

type SelectType = 'auto' | 'select' | 'combobox';
type ResolvedSelectType = Exclude<SelectType, 'auto'>;
type SelectValueType = 'value' | 'option';

const COMBOBOX_THRESHOLD = 7;

const resolveRenderedSelectType = (selectType: SelectType = 'auto', optionCount: number): ResolvedSelectType => {
  if (selectType === 'select' || selectType === 'combobox') {
    return selectType;
  }

  return optionCount >= COMBOBOX_THRESHOLD ? 'combobox' : 'select';
};

const getCurrentValue = (stateValue: unknown, valueType: SelectValueType = 'value') => {
  if (valueType === 'option') {
    return (stateValue as ComponentValue | undefined)?.value ?? '';
  }

  return typeof stateValue === 'string' ? stateValue : '';
};

const getStateValue = (value: string, valueType: SelectValueType = 'value', options: ComponentValue[]) => {
  if (valueType === 'option') {
    return value ? options.find((option) => option.value === value) : undefined;
  }

  return value;
};

export { COMBOBOX_THRESHOLD, getCurrentValue, getStateValue, resolveRenderedSelectType };
export type { ResolvedSelectType, SelectType, SelectValueType };
