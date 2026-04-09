import { currencyUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

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
