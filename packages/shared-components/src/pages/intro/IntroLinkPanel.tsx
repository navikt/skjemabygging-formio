import '@navikt/ds-css/darkside';
import { LinkCard, Theme } from '@navikt/ds-react';
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

  return (
    <Theme>
      <LinkCard
        data-color="accent"
        className={className}
        onClick={
          onClick
            ? (event) => {
                event.preventDefault();
                onClick();
              }
            : undefined
        }
      >
        <LinkCard.Title>
          <LinkCard.Anchor
            href={href ?? '#'}
            onClick={(event) => {
              if (href) {
                return;
              }

              event.preventDefault();
            }}
          >
            {translate(title)}
          </LinkCard.Anchor>
        </LinkCard.Title>
        <LinkCard.Description>{translate(description)}</LinkCard.Description>
      </LinkCard>
    </Theme>
  );
};

export default IntroLinkPanel;
