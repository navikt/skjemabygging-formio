import { MenuHamburgerIcon } from '@navikt/aksel-icons';
import { Dropdown, InternalHeader } from '@navikt/ds-react';
import useUnsavedChangesModal from '../../../hooks/useUnsavedChangesModal';
import { AdminMenuLink } from './AdminMenuLink';

const AdminMenu = ({ showImport = false }) => {
  const { showUnsavedChangesModal, unsavedChangesModalContent } = useUnsavedChangesModal();

  return (
    <>
      <Dropdown>
        <InternalHeader.Button as={Dropdown.Toggle} className="ml-auto" aria-label="Åpne meny">
          <MenuHamburgerIcon fontSize={'1.5rem'} role="presentation" />
        </InternalHeader.Button>
        <Dropdown.Menu>
          <Dropdown.Menu.GroupedList>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/oversettelser">
                Globale Oversettelser
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/migrering">
                Migrering
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/bulk-publisering">
                Bulkpublisering
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/mottakere">
                Mottakere
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>

            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/rapporter">
                Rapporter
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            {showImport && (
              <Dropdown.Menu.GroupedList.Item>
                <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/import/skjema">
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
