import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import { makeStyles, useLanguages } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
import React from 'react';

interface Props {
  onClick: () => void;
  title: string;
  description: string;
  className?: string;
  href?: string;
}

const useStyles = makeStyles({
  container: {
    borderRadius: '8px',
    border: '1px solid var(--a-border-subtle)',
    display: 'flex',
    padding: 'var(--a-spacing-4)',
    gap: 'var(--a-spacing-4)',
    alignItems: 'center',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'var(--a-surface-action-subtle)',
    },
  },

  content: {
    flex: '1 1 auto',
  },
  description: {
    margin: '0',
  },
  arrowIcon: {
    color: 'var(--a-surface-action)',
    flex: '0 0 auto',
  },
});

const IntroLinkPanel = ({ onClick, title, description, className, href }: Props) => {
  const styles = useStyles();
  const { translate } = useLanguages();

  return (
    <div className={classNames(styles.container, className)} onClick={onClick}>
      <div className={styles.content}>
        <Link
          href={href ?? '#'}
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
          }}
        >
          {translate(title)}
        </Link>
        <p className={styles.description}>{translate(description)}</p>
      </div>
      <ArrowRightIcon aria-hidden="true" fontSize="1.5rem" className={styles.arrowIcon} />
    </div>
  );
};

export default IntroLinkPanel;
