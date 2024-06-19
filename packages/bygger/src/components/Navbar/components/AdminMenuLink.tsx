import { Link } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  to: string;
  showUnsavedChangesModal: (event: React.MouseEvent, { redirectTo }: { redirectTo: string }) => void;
}

const useStyles = makeStyles({
  adminLink: {
    width: '100%',
  },
});

export const AdminMenuLink = ({ children, to, showUnsavedChangesModal }: Props) => {
  const styles = useStyles();
  return (
    <>
      <Link
        as={ReactRouterLink}
        className={styles.adminLink}
        to={to}
        onClick={(e) => showUnsavedChangesModal(e, { redirectTo: to })}
      >
        {children}
      </Link>
    </>
  );
};
