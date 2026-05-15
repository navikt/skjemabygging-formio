import { dateUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfMonthPicker = (props: PdfComponentProps) => {
  const { currentLanguage } = props;
  const formatMonth = (value: string) => {
    return stringUtils.toPascalCase(dateUtils.toLongMonthFormat(value, currentLanguage));
  };
  return DefaultAnswer(props, formatMonth);
};

export default PdfMonthPicker;
