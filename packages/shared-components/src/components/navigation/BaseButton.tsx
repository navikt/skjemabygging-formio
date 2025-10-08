import { Button } from '@navikt/ds-react';
import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { useAppConfig } from '../../context/config/configContext';

export type BaseButtonProps = {
  onClick: Partial<Record<SubmissionMethod, () => void>>;
  label: Partial<Record<SubmissionMethod, string>>;
  href?: Partial<Record<SubmissionMethod, string>>;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
  iconPosition?: 'left' | 'right';
};

export function BaseButton({ label, onClick, href, icon, iconPosition, variant }: BaseButtonProps) {
  const { submissionMethod } = useAppConfig();

  const handleClick = onClick[submissionMethod!] ?? undefined;
  const buttonLabel = label[submissionMethod!] ?? undefined;
  const buttonHref = href && submissionMethod ? href[submissionMethod] : undefined;

  if (!buttonLabel) return null;

  return (
    <Button
      as={href ? 'a' : 'button'}
      role={href && 'link'}
      {...{ href: buttonHref }}
      onClick={handleClick}
      icon={icon}
      iconPosition={iconPosition}
      variant={variant}
    >
      {buttonLabel}
    </Button>
  );
}
