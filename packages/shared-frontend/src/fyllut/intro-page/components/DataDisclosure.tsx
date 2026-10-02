import { IntroPageSection, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from './IntroAccordion';
import { InnerHtmlLong } from './SanitizedHtml';

interface Props {
  properties?: IntroPageSection;
  translate: TranslateFunction;
  className?: string;
  defaultOpen?: boolean;
}

const DataDisclosure = ({ properties, translate, className, defaultOpen }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <IntroAccordion
      title={translate(properties.title)}
      description={translate('introPage.dataDisclosure.ingress')}
      bulletPoints={['introPage.dataDisclosure.nationalPopulationRegister', ...(properties.bulletPoints ?? [])].map(
        (bulletPoint) => translate(bulletPoint),
      )}
      contentBottom={<InnerHtmlLong content={translate('introPage.dataTreatment.readMore')} />}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
};

export default DataDisclosure;
