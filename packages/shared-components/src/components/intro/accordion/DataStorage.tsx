import { introPageTexts, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  translate: (key?: Tkey) => string;
  className?: string;
  defaultOpen?: boolean;
}

const DataStorage = ({ translate, className, defaultOpen }: Props) => {
  const title = translate(introPageTexts.dataStorage.title);
  const description = translate(introPageTexts.dataStorage.ingress);

  return <IntroAccordion title={title} description={description} className={className} defaultOpen={defaultOpen} />;
};

export default DataStorage;
