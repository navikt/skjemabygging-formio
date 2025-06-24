import { IntroPageSection, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
}

const AutomaticProcessing = ({ properties, translate, className }: Props) => {
  if (!properties) {
    return null;
  }

  const title: Tkey = 'introPage.automaticProcessing.title';
  const bulletPoints = (properties?.bulletPoints ?? []).map(translate);

  return (
    <IntroAccordion
      title={translate(title)}
      description={translate(properties?.description)}
      bulletPoints={bulletPoints}
      className={className}
    />
  );
};

export default AutomaticProcessing;
