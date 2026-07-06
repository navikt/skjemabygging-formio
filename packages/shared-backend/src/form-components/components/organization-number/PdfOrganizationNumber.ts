import { formatUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultAnswer from '../../shared/PdfDefaultAnswer';
import { PdfComponentProps } from '../../types';

const PdfOrganizationNumber = (props: PdfComponentProps) => {
  return DefaultAnswer(props, (value) => formatUtils.removeAllSpaces(String(value)));
};

export default PdfOrganizationNumber;
