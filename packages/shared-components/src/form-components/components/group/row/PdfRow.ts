import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultSection from '../../shared/pdf/DefaultSection';
import { getCurrencyValue } from './rowUtils';

const PdfRow = (props: PdfComponentProps) => {
  const { component, submissionPath, formContextValue, languagesContextValue } = props;
  const { components, isAmountWithCurrencySelector, label } = component;
  const { submission } = formContextValue;
  const { translate } = languagesContextValue;

  if (!components || !submission || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  if (isAmountWithCurrencySelector) {
    const currencyValue = getCurrencyValue(submissionPath, components, submission);

    return {
      label: translate(label),
      verdi: currencyValue,
    };
  }

  return DefaultSection(props);
};

export default PdfRow;
