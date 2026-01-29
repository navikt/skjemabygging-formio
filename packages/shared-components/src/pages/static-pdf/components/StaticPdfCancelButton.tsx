import { BaseButton } from '../../../components/navigation/BaseButton';
import url from '../../../util/url/url';
import type StaticPdfPage from '../StaticPdfWrapper';

interface Props {
  page: StaticPdfPage;
}

const StaticPdfCancelButton = ({ page }: Props) => {
  const exitUrl = url.getExitUrl(window.location.href);

  return (
    <>
      <BaseButton
        onClick={{
          default: () => window.location.assign(exitUrl),
        }}
        variant="tertiary"
        label={{
          default: page === 'input' ? 'Avbryt' : 'Avslutt',
        }}
        role="button"
      />
    </>
  );
};

export default StaticPdfCancelButton;
