import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../../../context/languages';
import url from '../../../../util/url/url';

const CancelButton = ({ variant = 'tertiary' }: { variant: 'primary' | 'secondary' | 'tertiary' }) => {
  const { translate } = useLanguages();
  const exitUrl = url.getExitUrl(window.location.href);

  return (
    <a className={`navds-button navds-button--${variant}`} href={exitUrl}>
      <span aria-live="polite" className="navds-body-short font-bold">
        {translate(TEXTS.grensesnitt.navigation.exit)}
      </span>
    </a>
  );
};

export default CancelButton;
