import { PdfData } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';

const DefaultHtmlAnswer = (props: PdfComponentProps): PdfData | null => {
  const { component, translate } = props;
  const { textDisplay, content } = component;

  if (!content || textDisplay === undefined || textDisplay === 'form') {
    return null;
  }

  return {
    label: translate(content),
    visningsVariant: 'HTML',
  };
};

export default DefaultHtmlAnswer;
