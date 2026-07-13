type SelectType = 'auto' | 'select' | 'combobox';
type ResolvedSelectType = Exclude<SelectType, 'auto'>;

const COMBOBOX_THRESHOLD = 7;

const resolveRenderedSelectType = (selectType: SelectType = 'auto', optionCount: number): ResolvedSelectType => {
  if (selectType === 'select' || selectType === 'combobox') {
    return selectType;
  }

  return optionCount >= COMBOBOX_THRESHOLD ? 'combobox' : 'select';
};

export { COMBOBOX_THRESHOLD, resolveRenderedSelectType };
export type { ResolvedSelectType, SelectType };
