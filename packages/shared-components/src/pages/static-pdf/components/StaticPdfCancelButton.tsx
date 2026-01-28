import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { BaseButton } from '../../../components/navigation/BaseButton';
import { useLanguages } from '../../../context/languages';
import url from '../../../util/url/url';
import type StaticPdfPage from '../StaticPdfWrapper';

interface Props {
  page: StaticPdfPage;
}

const StaticPdfCancelButton = ({ page }: Props) => {
  const { translate } = useLanguages();
  const exitUrl = url.getExitUrl(window.location.href);

  return (
    <>
      <BaseButton
        onClick={{
          default: () => window.location.assign(exitUrl),
        }}
        variant="tertiary"
        label={{
          default:
            page === 'input'
              ? translate(TEXTS.grensesnitt.navigation.cancel)
              : translate(TEXTS.grensesnitt.navigation.exit),
        }}
        role="button"
      />
    </>
  );
};

export default StaticPdfCancelButton;
