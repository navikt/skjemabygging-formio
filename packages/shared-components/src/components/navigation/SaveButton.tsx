import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import { BaseButton, BaseButtonProps } from './BaseButton';

export function SaveButton({ onClick, href, variant = 'tertiary' }: BaseButtonProps) {
  const { translate } = useLanguages();

  return (
    <BaseButton
      href={href}
      onClick={onClick}
      variant={variant}
      label={{
        digital: translate(TEXTS.grensesnitt.navigation.saveDraft),
      }}
    />
  );
}
