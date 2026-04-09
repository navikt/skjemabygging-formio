import { TranslatedDescription as SharedFrontendTranslatedDescription } from '@navikt/skjemadigitalisering-shared-frontend';
import { useLanguages } from '../../../../../context/languages';

interface TranslatedDescriptionProps {
  children?: string;
}

const TranslatedDescription = (props: TranslatedDescriptionProps) => {
  const { translate } = useLanguages();
  const { children } = props;

  if (!children) {
    return null;
  }

  return <SharedFrontendTranslatedDescription translate={translate}>{children}</SharedFrontendTranslatedDescription>;
};

export default TranslatedDescription;
