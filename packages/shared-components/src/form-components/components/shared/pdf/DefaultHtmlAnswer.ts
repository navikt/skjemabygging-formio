import { PdfComponentProps } from '../../../types';

const DefaultHtmlAnswer = ({ component, languagesContext }: PdfComponentProps) => {
  const { textDisplay, content } = component;
  const { translate } = languagesContext;

  if (!content || textDisplay === undefined || textDisplay === 'form') {
    return null;
  }

  return {
    verdi: translate(content).toString(),
    visningsVariant: 'HTML',
  };
};

export default DefaultHtmlAnswer;
