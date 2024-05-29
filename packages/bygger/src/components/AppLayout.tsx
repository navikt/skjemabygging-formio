import { makeStyles, navCssVariables } from '@navikt/skjemadigitalisering-shared-components';
import React from 'react';
import PageWrapper from '../Forms/PageWrapper';
import { NavBar, NavBarProps } from './Navbar/NavBar';

export interface Props {
  children: React.ReactNode;
  navBarProps?: NavBarProps;
}

const useStyles = makeStyles({
  noScroll: {
    backgroundColor: navCssVariables.navGraBakgrunn,
    position: 'sticky',
    top: '0',
    zIndex: 900,
  },
});

export const AppLayout = ({ children, navBarProps }: Props) => {
  const styles = useStyles();
  return (
    <>
      <div className={styles.noScroll}>
        <NavBar {...navBarProps} />
      </div>
      <PageWrapper>{children}</PageWrapper>
    </>
  );
};
