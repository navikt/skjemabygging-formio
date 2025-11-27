import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';

const SummaryNavSelect = (props: FormComponentProps) => {
  const { translate, component } = props;

  const getLabelFromValue = (value?: string) => {
    const option = component.data?.values?.find((dataValue) => dataValue.value === value);
    return option?.label ? translate(option?.label || '') : translate(value);
  };

  return <DefaultAnswer {...props} valueFormat={getLabelFromValue} />;
};

export default SummaryNavSelect;
