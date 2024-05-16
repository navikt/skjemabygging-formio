import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
import React from 'react';
import { NavLink } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  to: string;
  dataKey?: string;
  noIconStyling: boolean;
}

const useStyles = makeStyles({
  navBarLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 15px',
    flexDirection: 'column',
    color: 'var(--a-gray-50)',
    textDecoration: 'none',
    lineHeight: '20px',
    '@media (max-width: 960px)': {
      height: '100%',
      flexDirection: 'row',
    },
    '&.active': {
      borderBottom: '4px solid var(--a-border-action)',
      paddingBottom: '0',
    },
  },
  navBarLinkNoIcon: {
    flexDirection: 'row',
  },
});

export const MenuLink = ({ children, to, dataKey, noIconStyling }: Props) => {
  const styles = useStyles();

  return (
    <>
      <NavLink
        className={classNames(styles.navBarLink, { [styles.navBarLinkNoIcon]: noIconStyling })}
        to={to}
        data-key={dataKey}
      >
        {children}
      </NavLink>
    </>
  );
};
