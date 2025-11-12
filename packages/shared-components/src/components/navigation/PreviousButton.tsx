import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { BaseButton, BaseButtonProps } from './BaseButton';

export function PreviousButton({ onClick, label, href, variant = 'secondary' }: BaseButtonProps) {
  return (
    <BaseButton
      label={label}
      href={href}
      onClick={onClick}
      icon={<ArrowLeftIcon aria-hidden />}
      iconPosition="left"
      variant={variant}
    />
  );
}
