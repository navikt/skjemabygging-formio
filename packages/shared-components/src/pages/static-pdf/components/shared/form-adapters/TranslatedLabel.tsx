import { TranslatedLabel as SharedFrontendTranslatedLabel } from '@navikt/skjemadigitalisering-shared-frontend';
import { useLanguages } from '../../../../../context/languages';

type LabelOptions = {
  required?: boolean;
  readOnly?: boolean;
};

interface TranslatedLabelProps {
  children: string;
  options?: LabelOptions;
}

const TranslatedLabel = (props: TranslatedLabelProps) => {
  const { translate } = useLanguages();
  const { children, options } = props;

  return (
    <SharedFrontendTranslatedLabel translate={translate} options={options}>
      {children}
    </SharedFrontendTranslatedLabel>
  );
};

export default TranslatedLabel;
