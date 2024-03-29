import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
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
    alignSelf: 'center',
    alignItems: 'center',
    padding: '5px 15px 0 15px',
    flexDirection: 'column',
    color: '#a1a1a1',
    textDecoration: 'none',
    '@media (max-width: 1040px)': {
      height: '100%',
      flexDirection: 'row',
      padding: '0 15px 0 15px',
    },
  },
  navBarLinkNoIcon: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '0 15px 0 15px',
    color: '#a1a1a1',
    textDecoration: 'none',
  },
});

export const MenuLink = ({ children, to, dataKey, noIconStyling }: Props) => {
  const styles = useStyles();
  const navLinkActiveStyle = { color: '#ffffff', borderBottom: '3px solid #0074df' };

  return (
    <>
      <NavLink
        className={`${noIconStyling ? styles.navBarLinkNoIcon : styles.navBarLink}`}
        to={to}
        data-key={dataKey}
        style={({ isActive }) => (isActive ? navLinkActiveStyle : {})}
      >
        {children}
      </NavLink>
    </>
  );
};
