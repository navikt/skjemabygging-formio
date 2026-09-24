import { TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from './IntroAccordion';

interface Props {
  translate: TranslateFunction;
  className?: string;
  defaultOpen?: boolean;
}

const DataStorage = ({ translate, className, defaultOpen }: Props) => (
  <IntroAccordion
    title={translate('introPage.dataStorage.title.digital')}
    description={translate('introPage.dataStorage.ingress.digital')}
    className={className}
    defaultOpen={defaultOpen}
  />
);

export default DataStorage;
