import { PdfComponentProps } from '../../../types';

const DefaultHtmlAnswer = ({ component, languagesContextValue }: PdfComponentProps) => {
  const { textDisplay, content } = component;
  const { translate } = languagesContextValue;

  if (!content || textDisplay === undefined || textDisplay === 'form') {
    return null;
  }

  return {
    label: translate(content),
    visningsVariant: 'HTML',
  };
};

export default DefaultHtmlAnswer;
