import { System } from '@navikt/ds-icons';
import { Dropdown, InternalHeader } from '@navikt/ds-react';
import useUnsavedChangesModal from '../../../hooks/useUnsavedChangesModal';
import { AdminMenuLink } from './AdminMenuLink';

const AdminMenu = ({ showImport = false }) => {
  const { showUnsavedChangesModal, unsavedChangesModalContent } = useUnsavedChangesModal();

  return (
    <>
      <Dropdown>
        <InternalHeader.Button as={Dropdown.Toggle} className="ml-auto" aria-label="Åpne meny">
          <System fontSize={'1.5rem'} role="presentation" />
        </InternalHeader.Button>
        <Dropdown.Menu>
          <Dropdown.Menu.GroupedList>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/oversettelser">
                Globale Oversettelser
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/migrering" disabled>
                Migrering
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/bulk-publisering" disabled>
                Bulkpublisering
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/mottakere">
                Mottakere
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>

            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/rapporter" disabled>
                Rapporter
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            {showImport && (
              <Dropdown.Menu.GroupedList.Item>
                <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/import/skjema" disabled>
                  Importer
                </AdminMenuLink>
              </Dropdown.Menu.GroupedList.Item>
            )}
          </Dropdown.Menu.GroupedList>
        </Dropdown.Menu>
      </Dropdown>
      {unsavedChangesModalContent}
    </>
  );
};

export default AdminMenu;
