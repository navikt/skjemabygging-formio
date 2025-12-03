import '@navikt/ds-css/darkside';
import { LinkCard, Theme } from '@navikt/ds-react';
import classNames from 'classnames';
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

  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!onClick) {
        return;
      }
      event.preventDefault();
      onClick();
    },
    [onClick],
  );

  const cardClassName = classNames('mb-4', className);

  return (
    <Theme>
      <LinkCard data-color="accent" className={cardClassName} onClick={onClick ? handleClick : undefined}>
        <LinkCard.Title>
          <LinkCard.Anchor href={href ?? '#'} onClick={onClick ? handleClick : undefined}>
            {translate(title)}
          </LinkCard.Anchor>
        </LinkCard.Title>
        <LinkCard.Description>{translate(description)}</LinkCard.Description>
      </LinkCard>
    </Theme>
  );
};

export default IntroLinkPanel;
