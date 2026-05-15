import { submissionUtils as formComponentUtils, getCurrencyValue } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultSection from '../../shared/pdf/DefaultSection';

const PdfRow = (props: PdfComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { components, isAmountWithCurrencySelector, label } = component;

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
