import { Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  translate: (key?: Tkey) => string;
  className?: string;
  defaultOpen?: boolean;
}

const DataStorage = ({ translate, className, defaultOpen }: Props) => {
  const title = translate('introPage.dataStorage.title.digital');
  const description = translate('introPage.dataStorage.ingress.digital');

  return <IntroAccordion title={title} description={description} className={className} defaultOpen={defaultOpen} />;
};

export default DataStorage;
