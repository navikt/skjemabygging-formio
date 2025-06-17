import { IntroPageSection } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../context/languages';
import InnerHtmlLong from '../../inner-html/InnerHtmlLong';

interface Props {
  properties?: IntroPageSection;
}

const IntroDescription = ({ properties }: Props) => {
  const { translate } = useLanguages();
  if (!properties?.description) {
    return null;
  }

  return <InnerHtmlLong content={translate(properties.description)} spacing />;
};

export default IntroDescription;
