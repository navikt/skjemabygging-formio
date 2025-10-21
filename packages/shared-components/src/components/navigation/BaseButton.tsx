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
  onClick?: Partial<Record<SubmissionMethod, () => void>>;
  label: Partial<Record<SubmissionMethod, string>>;
  href?: Partial<Record<SubmissionMethod, HrefProps | string>>;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  iconPosition?: 'left' | 'right';
};

export function BaseButton({ label, onClick, href, icon, iconPosition, variant }: BaseButtonProps) {
  const { submissionMethod } = useAppConfig();

  const handleClick = onClick ? onClick[submissionMethod!] : undefined;
  const buttonLabel = label[submissionMethod!] ?? undefined;
  const buttonHref = href && submissionMethod ? href[submissionMethod] : undefined;

  if (!buttonLabel) return null;

  return buttonHref ? (
    <Button as={ReactRouterLink} to={buttonHref} role="link" icon={icon} iconPosition={iconPosition} variant={variant}>
      {buttonLabel}
    </Button>
  ) : (
    <Button
      role="link"
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
