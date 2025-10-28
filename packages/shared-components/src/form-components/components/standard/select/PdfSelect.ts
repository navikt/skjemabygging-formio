import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfSelect = (props: PdfComponentProps) => {
  const { languagesContextValue } = props;

  const getLabelFromValue = (value?: string) => {
    const option = props.component.data?.values?.find((dataValue) => dataValue.value === value);
    return option?.label
      ? languagesContextValue.translate(option?.label || '')
      : languagesContextValue.translate(value);
  };

  return DefaultAnswer(props, getLabelFromValue);
};

export default PdfSelect;
