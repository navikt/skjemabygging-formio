import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import { BaseButton, BaseButtonProps } from './BaseButton';

export function CancelButton({ onClick, href, variant = 'tertiary' }: BaseButtonProps) {
  const { translate } = useLanguages();

  return (
    <BaseButton
      href={href}
      onClick={onClick}
      variant={variant}
      label={{
        digital: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
        digitalnologin: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
        paper: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
      }}
    />
  );
}
