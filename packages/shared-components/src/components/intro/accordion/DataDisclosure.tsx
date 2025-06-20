import { IntroPageSection, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
}

const DataDisclosure = ({ properties, translate, className }: Props) => {
  if (!properties?.title) {
    return null;
  }

  const staticBulletPoints: Tkey[] = ['introPage.dataDisclosure.nationalPopulationRegister'];
  const bulletPoints = [...staticBulletPoints, ...(properties?.bulletPoints ?? [])].map(translate);

  return (
    <IntroAccordion
      title={translate(properties?.title)}
      description={translate(properties?.description)}
      bulletPoints={bulletPoints}
      className={className}
    />
  );
};

export default DataDisclosure;
