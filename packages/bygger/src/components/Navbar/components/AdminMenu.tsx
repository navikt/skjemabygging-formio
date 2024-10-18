import { System } from '@navikt/ds-icons';
import { Dropdown, InternalHeader, Tag } from '@navikt/ds-react';
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
              <AdminMenuLink
                showUnsavedChangesModal={showUnsavedChangesModal}
                to="/translations/global/nn-NO/skjematekster"
              >
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
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/mottaksadresser">
                Rediger mottaksadresser
              </AdminMenuLink>
            </Dropdown.Menu.GroupedList.Item>
            <Dropdown.Menu.GroupedList.Item>
              <AdminMenuLink showUnsavedChangesModal={showUnsavedChangesModal} to="/mottakere">
                Mottakere
              </AdminMenuLink>
              <Tag size={'small'} variant={'warning'}>
                Beta
              </Tag>
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
