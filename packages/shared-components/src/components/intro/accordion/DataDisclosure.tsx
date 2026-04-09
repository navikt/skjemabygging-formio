import { IntroPageSection, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtmlLong from '../../inner-html/InnerHtmlLong';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
  defaultOpen?: boolean;
}

const DataDisclosure = ({ properties, translate, className, defaultOpen }: Props) => {
  if (!properties?.title) {
    return null;
  }

  const description: Tkey = 'introPage.dataDisclosure.ingress';
  const staticBulletPoints: Tkey[] = ['introPage.dataDisclosure.nationalPopulationRegister'];
  const bulletPoints = [...staticBulletPoints, ...(properties?.bulletPoints ?? [])].map(translate);
  const readMore: Tkey = 'introPage.dataTreatment.readMore';

  return (
    <IntroAccordion
      title={translate(properties?.title)}
      description={translate(description)}
      bulletPoints={bulletPoints}
      contentBottom={<InnerHtmlLong content={translate(readMore)} />}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
};

export default DataDisclosure;
