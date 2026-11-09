import { introPageTexts, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from './IntroAccordion';

interface Props {
  translate: TranslateFunction;
  className?: string;
  defaultOpen?: boolean;
}

const DataStorage = ({ translate, className, defaultOpen }: Props) => (
  <IntroAccordion
    title={translate(introPageTexts.dataStorage.title)}
    description={translate(introPageTexts.dataStorage.ingress)}
    className={className}
    defaultOpen={defaultOpen}
  />
);

export default DataStorage;
