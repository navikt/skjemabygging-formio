import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import { DefaultAnswer } from '../../shared/form-summary';

const SummaryNavSelect = ({ component, submissionPath }: FormComponentProps) => {
  const { translate } = useLanguages();

  const getLabelFromValue = (value?: string) => {
    const option = component.data?.values?.find((dataValue) => dataValue.value === value);
    return option?.label ? translate(option?.label || '') : translate(value);
  };

  return <DefaultAnswer component={component} submissionPath={submissionPath} valueFormat={getLabelFromValue} />;
};

export default SummaryNavSelect;
