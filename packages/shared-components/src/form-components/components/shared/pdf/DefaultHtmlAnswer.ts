import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../../index';

interface Props {
  component: Component;
}

const DefaultHtmlAnswer = ({ component }: Props) => {
  const { textDisplay, content } = component;
  const { translate } = useLanguages();

  if (!content || textDisplay === 'form') {
    return null;
  }

  return {
    verdi: translate(content),
    visningsVariant: 'HTML',
  };
};

export default DefaultHtmlAnswer;
