import { ArrowRightIcon } from '@navikt/aksel-icons';
import { BaseButton, BaseButtonProps } from './BaseButton';

type Props = BaseButtonProps & {
  hideIcon?: boolean;
  loading?: boolean;
};

export function NextButton({ onClick, label, href, variant, hideIcon, loading }: Props) {
  return (
    <BaseButton
      label={label}
      href={href}
      onClick={onClick}
      icon={!hideIcon && <ArrowRightIcon aria-hidden />}
      variant={variant}
      iconPosition="right"
      loading={loading}
    />
  );
}
