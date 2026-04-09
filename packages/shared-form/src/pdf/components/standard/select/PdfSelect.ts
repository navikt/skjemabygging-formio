import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfSelect = (props: PdfComponentProps) => {
  const { translate, component } = props;

  const getLabelFromValue = (value?: string) => {
    const option = component.data?.values?.find((dataValue) => dataValue.value === value);
    return option?.label ? translate(option?.label || '') : translate(value);
  };

  return DefaultAnswer(props, getLabelFromValue);
};

export default PdfSelect;
