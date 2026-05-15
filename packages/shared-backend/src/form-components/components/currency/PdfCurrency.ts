import { currencyUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfCurrency = (props: PdfComponentProps) => {
  const { currency, inputType } = props.component;
  const formatCurrency = (value: string) =>
    currencyUtils.toLocaleString(value, {
      iso: true,
      currency,
      integer: inputType === 'numeric',
    });

  return DefaultAnswer(props, formatCurrency);
};

export default PdfCurrency;
