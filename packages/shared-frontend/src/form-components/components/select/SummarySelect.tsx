import { SelectDefinition } from '../../component-types';
import { DefaultAnswer } from '../../shared';
import { FormComponentProps } from '../../types';

const SummaryNavSelect = (props: FormComponentProps<SelectDefinition>) => {
  const { translate, component } = props;

  const getLabelFromValue = (value?: string | { value?: string; label?: string }) => {
    const selectedValue = typeof value === 'string' ? value : value?.value;
    const option = component.data?.values?.find((dataValue) => dataValue.value === selectedValue);
    return option?.label ? translate(option?.label || '') : translate(selectedValue ?? '');
  };

  return <DefaultAnswer {...props} valueFormat={getLabelFromValue} />;
};

export default SummaryNavSelect;
