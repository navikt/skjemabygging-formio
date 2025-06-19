import { IntroPageSection, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../../../context/config/configContext';
import IntroAccordion from '../shared/IntroAccordion';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: Tkey) => string;
  className?: string;
}

const DataStorage = ({ properties, translate, className }: Props) => {
  const { app, submissionMethod } = useAppConfig();
  if (!properties) {
    return null;
  }

  const isPaperSubmission = submissionMethod === 'paper' || app === 'bygger';
  const title = isPaperSubmission
    ? translate('introPage.dataStorage.title.paper')
    : translate('introPage.dataStorage.title.digital');
  const description = isPaperSubmission
    ? translate('introPage.dataStorage.ingress.paper')
    : translate('introPage.dataStorage.ingress.digital');

  return <IntroAccordion title={title} description={description} className={className} />;
};

export default DataStorage;
