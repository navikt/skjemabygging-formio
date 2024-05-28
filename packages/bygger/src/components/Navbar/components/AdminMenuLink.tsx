import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  to: string;
  showUnsavedChangesModal: (event: React.MouseEvent, { redirectTo }: { redirectTo: string }) => void;
}

export const AdminMenuLink = ({ children, to, showUnsavedChangesModal }: Props) => {
  return (
    <>
      <Link to={to} onClick={(e) => showUnsavedChangesModal(e, { redirectTo: to })}>
        {children}
      </Link>
    </>
  );
};
