import { Page } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import React from 'react';
import PageWrapper from '../Forms/PageWrapper';
import { NavBar, NavBarProps } from './Navbar/NavBar';

export interface Props {
  children: React.ReactNode;
  navBarProps?: NavBarProps;
}

const useStyles = makeStyles({
  page: {
    minWidth: '1024px',
  },
  headerContainer: {
    backgroundColor: 'var(--ax-bg-default)',
    position: 'sticky',
    top: '0',
    zIndex: 10001,
    height: '5.5rem',
  },
});

export const AppLayout = ({ children, navBarProps }: Props) => {
  const styles = useStyles();
  return (
    <Page className={styles.page}>
      <div className={styles.headerContainer}>
        <NavBar {...navBarProps} />
      </div>
      <Page.Block width="2xl">
        <PageWrapper>{children}</PageWrapper>
      </Page.Block>
    </Page>
  );
};
