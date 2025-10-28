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
  onClick?: Partial<Record<SubmissionMethod | 'none', () => void>>;
  label: Partial<Record<SubmissionMethod | 'none', string>>;
  href?: Partial<Record<SubmissionMethod | 'none', HrefProps | string>>;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  iconPosition?: 'left' | 'right';
  role?: 'link' | 'button';
};

export function BaseButton({ label, onClick, href, icon, iconPosition, variant, role = 'link' }: BaseButtonProps) {
  const { submissionMethod = 'none' } = useAppConfig();

  const handleClick = onClick ? onClick[submissionMethod] : undefined;
  const buttonLabel = label[submissionMethod] ?? undefined;
  const buttonHref = href && submissionMethod ? href[submissionMethod] : undefined;

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
    >
      {buttonLabel}
    </Button>
  );
}
