import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfDatePicker = (props: PdfComponentProps) => {
  return DefaultAnswer(props, dateUtils.toLocaleDate);
};

export default PdfDatePicker;
