import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfSelect = (props: PdfComponentProps) => {
  const { translate, component } = props;

  const getLabelFromValue = (value?: string) => {
    const option = component.data?.values?.find((dataValue) => dataValue.value === value);
    return option?.label ? translate(option?.label || '') : translate(value);
  };

  return DefaultAnswer(props, getLabelFromValue);
};

export default PdfSelect;
