import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { InnerHtmlLong } from '../Html';
import { IntroAccordion } from './IntroShared';

interface Props {
  properties?: IntroPageSection;
  translate: (key?: string) => string;
  className?: string;
  defaultOpen?: boolean;
}

const AutomaticProcessing = ({ properties, translate, className, defaultOpen }: Props) => {
  if (!properties) {
    return null;
  }

  return (
    <IntroAccordion
      title={translate('introPage.automaticProcessing.title')}
      description={translate(properties.description)}
      bulletPoints={(properties.bulletPoints ?? []).map(translate)}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
};

const DataDisclosure = ({ properties, translate, className, defaultOpen }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <IntroAccordion
      title={translate(properties.title)}
      description={translate('introPage.dataDisclosure.ingress')}
      bulletPoints={['introPage.dataDisclosure.nationalPopulationRegister', ...(properties.bulletPoints ?? [])].map(
        translate,
      )}
      contentBottom={<InnerHtmlLong content={translate('introPage.dataTreatment.readMore')} />}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
};

const DataStorage = ({ translate, className, defaultOpen }: Omit<Props, 'properties'>) => (
  <IntroAccordion
    title={translate('introPage.dataStorage.title.digital')}
    description={translate('introPage.dataStorage.ingress.digital')}
    className={className}
    defaultOpen={defaultOpen}
  />
);

const Optional = ({ properties, translate, className, defaultOpen }: Props) => {
  if (!properties?.title) {
    return null;
  }

  return (
    <IntroAccordion
      title={translate(properties.title)}
      description={translate(properties.description)}
      bulletPoints={(properties.bulletPoints ?? []).map(translate)}
      className={className}
      defaultOpen={defaultOpen}
    />
  );
};

export { AutomaticProcessing, DataDisclosure, DataStorage, Optional };
