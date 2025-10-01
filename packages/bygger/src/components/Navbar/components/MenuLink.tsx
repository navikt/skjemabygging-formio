import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import classNames from 'classnames';
import React from 'react';
import { NavLink } from 'react-router';

interface Props {
  children: React.ReactNode;
  to: string;
  dataKey?: string;
  noIconStyling: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

const useStyles = makeStyles({
  navBarLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '5px 15px',
    flexDirection: 'column',
    color: 'var(--a-gray-50)',
    textDecoration: 'none',
    lineHeight: '20px',
    '&.active': {
      borderBottom: '5px solid var(--a-border-action)',
      paddingBottom: '0',
    },
  },
  navBarLinkNoIcon: {
    flexDirection: 'row',
  },
});

export const MenuLink = ({ children, to, dataKey, noIconStyling, onClick }: Props) => {
  const styles = useStyles();

  return (
    <>
      <NavLink
        className={classNames(styles.navBarLink, { [styles.navBarLinkNoIcon]: noIconStyling })}
        to={to}
        data-key={dataKey}
        onClick={onClick}
      >
        {children}
      </NavLink>
    </>
  );
};
