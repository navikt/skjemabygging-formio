import { IntroPageSection, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtmlLong from '../../inner-html/InnerHtmlLong';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
  defaultOpen?: boolean;
}

const DataTreatment = ({ properties, translate, className, defaultOpen }: Props) => {
  if (!properties) {
    return null;
  }

  const title: Tkey = 'introPage.dataTreatment.title';
  const bulletPoints = (properties?.bulletPoints ?? []).map(translate);
  const readMore: Tkey = 'introPage.dataTreatment.readMore';

  return (
    <IntroAccordion
      title={translate(title)}
      description={translate(properties?.description)}
      bulletPoints={bulletPoints}
      contentBottom={<InnerHtmlLong content={translate(readMore)} />}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
};

export default DataTreatment;
