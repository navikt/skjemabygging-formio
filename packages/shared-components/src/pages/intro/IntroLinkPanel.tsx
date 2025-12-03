import '@navikt/ds-css/darkside';
import { LinkCard, Theme } from '@navikt/ds-react';
import { MouseEvent, useCallback } from 'react';
import { useLanguages } from '../../context/languages';

interface Props {
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

const IntroLinkPanel = ({ title, description, href, onClick, className }: Props) => {
  const { translate } = useLanguages();

  const handleAnchorClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        event.preventDefault();
        onClick();
        return;
      }

      if (!href) {
        event.preventDefault();
      }
    },
    [href, onClick],
  );

  const anchorOnClick = onClick || !href ? handleAnchorClick : undefined;

  return (
    <Theme>
      <LinkCard data-color="accent" className={className}>
        <LinkCard.Title>
          <LinkCard.Anchor href={href ?? '#'} onClick={anchorOnClick}>
            {translate(title)}
          </LinkCard.Anchor>
        </LinkCard.Title>
        <LinkCard.Description>{translate(description)}</LinkCard.Description>
      </LinkCard>
    </Theme>
  );
};

export default IntroLinkPanel;
