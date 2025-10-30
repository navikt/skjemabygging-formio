import { Button } from '@navikt/ds-react';
import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { Link as ReactRouterLink } from 'react-router';
import { useAppConfig } from '../../context/config/configContext';

type HrefProps = {
  pathname: string;
  search?: string;
  hash?: string;
};
export type BaseButtonProps = {
  onClick?: Partial<Record<SubmissionMethod | 'none' | 'default', (e?: unknown) => void | Promise<void>>>;
  label: Partial<Record<SubmissionMethod | 'none' | 'default', string>>;
  href?: Partial<Record<SubmissionMethod | 'none' | 'default', HrefProps | string>>;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  iconPosition?: 'left' | 'right';
  role?: 'link' | 'button';
  loading?: boolean;
};

export function BaseButton({
  label,
  onClick,
  href,
  icon,
  iconPosition,
  variant,
  role = 'link',
  loading,
}: BaseButtonProps) {
  const { submissionMethod } = useAppConfig();

  const activeSubmissionMethod: SubmissionMethod | 'default' | 'none' = submissionMethod ?? 'default';
  const handleClick = onClick?.[activeSubmissionMethod] ?? onClick?.default;
  const buttonLabel = label[activeSubmissionMethod] ?? label.default;
  const buttonHref = href?.[activeSubmissionMethod] ?? href?.default;

  if (!buttonLabel) return null;

  return !onClick && buttonHref ? (
    <Button role={role} as={ReactRouterLink} to={buttonHref} icon={icon} iconPosition={iconPosition} variant={variant}>
      {buttonLabel}
    </Button>
  ) : (
    <Button
      role={role}
      onClick={(event) => {
        event.preventDefault();
        handleClick?.();
      }}
      icon={icon}
      iconPosition={iconPosition}
      variant={variant}
      loading={loading}
    >
      {buttonLabel}
    </Button>
  );
}
