import { dateUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../../context/languages';
import { PdfComponentProps } from '../../../types';
import DefaultAnswer from '../../shared/pdf/DefaultAnswer';

const PdfMonthPicker = (props: PdfComponentProps) => {
  const { currentLanguage } = useLanguages();
  const formatMonth = (value: string) => {
    return stringUtils.toPascalCase(dateUtils.toLongMonthFormat(value, currentLanguage));
  };
  return DefaultAnswer(props, formatMonth);
};

export default PdfMonthPicker;
