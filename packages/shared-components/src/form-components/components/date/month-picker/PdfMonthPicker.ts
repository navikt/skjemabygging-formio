import { dateUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfMonthPicker = (props: PdfComponentProps) => {
  const { languagesContextValue } = props;
  const { currentLanguage } = languagesContextValue;
  const formatMonth = (value: string) => {
    return stringUtils.toPascalCase(dateUtils.toLongMonthFormat(value, currentLanguage));
  };
  return DefaultAnswer(props, formatMonth);
};

export default PdfMonthPicker;
