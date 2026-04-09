import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfDatePicker = (props: PdfComponentProps) => {
  return DefaultAnswer(props, dateUtils.toLocaleDate);
};

export default PdfDatePicker;
