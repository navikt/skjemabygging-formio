import { Link } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import React from 'react';
import { Link as ReactRouterLink } from 'react-router';

interface Props {
  children: React.ReactNode;
  to: string;
  showUnsavedChangesModal: (event: React.MouseEvent, { redirectTo }: { redirectTo: string }) => void;
  disabled?: boolean;
}

const useStyles = makeStyles({
  adminLink: {
    width: '100%',
  },
  disabledAdminLink: {
    width: '100%',
    color: 'var(--a-text-default)',
    cursor: 'not-allowed',
  },
});

export const AdminMenuLink = ({ children, to, showUnsavedChangesModal, disabled = false }: Props) => {
  const styles = useStyles();

  if (disabled) {
    return <div className={styles.disabledAdminLink}>{children}</div>;
  }

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
