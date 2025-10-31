import { ArrowRightIcon } from '@navikt/aksel-icons';
import { BaseButton, BaseButtonProps } from './BaseButton';

export function NextButton({ onClick, label, href, variant }: BaseButtonProps) {
  return (
    <BaseButton
      label={label}
      href={href}
      onClick={onClick}
      icon={<ArrowRightIcon aria-hidden />}
      variant={variant}
      iconPosition="right"
    />
  );
}
