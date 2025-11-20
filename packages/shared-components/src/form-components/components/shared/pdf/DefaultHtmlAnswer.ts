import { PdfComponentProps } from '../../../types';

const DefaultHtmlAnswer = (props: PdfComponentProps) => {
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
