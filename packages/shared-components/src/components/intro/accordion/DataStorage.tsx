import { Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  translate: (key?: Tkey) => string;
  submissionMethod?: 'paper' | 'digital';
  className?: string;
  defaultOpen?: boolean;
}

const DataStorage = ({ translate, submissionMethod, className, defaultOpen }: Props) => {
  const isPaperSubmission = submissionMethod === 'paper';
  const title = isPaperSubmission
    ? translate('introPage.dataStorage.title.paper')
    : translate('introPage.dataStorage.title.digital');
  const description = isPaperSubmission
    ? translate('introPage.dataStorage.ingress.paper')
    : translate('introPage.dataStorage.ingress.digital');

  return <IntroAccordion title={title} description={description} className={className} defaultOpen={defaultOpen} />;
};

export default DataStorage;
