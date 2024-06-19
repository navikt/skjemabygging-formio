import { HomeFilled } from '@navikt/ds-icons';
import { InternalHeader, Link } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Link as ReactRouterLink } from 'react-router-dom';
import { useAuth } from '../../context/auth-context';
import useUnsavedChangesModal from '../../hooks/useUnsavedChangesModal';
import AdminMenu from './components/AdminMenu';
import { FormMenu } from './components/FormMenu';
import { ListMenu } from './components/ListMenu';
import NotificationDropdown from './components/NotificationDropdown';
import { TranslationsMenu } from './components/TranslationsMenu';
import UserMenu from './components/UserMenu';
import { useNavBarStyles } from './styles';

export interface NavBarProps {
  formPath?: string;
  formMenu?: boolean;
  formListMenu?: boolean;
  translationMenu?: boolean;
}

export const NavBar = ({ formPath, formMenu, formListMenu, translationMenu }: NavBarProps) => {
  const { userData } = useAuth();
  const { config } = useAppConfig();
  const styles = useNavBarStyles();
  const showAdmin = userData?.isAdmin;
  const { showUnsavedChangesModal, unsavedChangesModalContent } = useUnsavedChangesModal();

  return (
    <section>
      <InternalHeader className={config?.isDevelopment ? styles.navBarLocal : styles.navBar}>
        <Link
          as={ReactRouterLink}
          className={styles.formsLink}
          to={'/forms'}
          aria-label="Gå til skjemaliste"
          onClick={(e) => showUnsavedChangesModal(e, { redirectTo: '/forms' })}
        >
          <HomeFilled fontSize="1.5rem" role="presentation" />
        </Link>
        <div className={styles.navBarLinks}>
          {formMenu && <FormMenu formPath={formPath} />}
          {formListMenu && <ListMenu />}
          {translationMenu && <TranslationsMenu />}
        </div>
        <div className={styles.headerMenus}>
          <NotificationDropdown />
          {showAdmin && <AdminMenu showImport={!config?.isProdGcp} />}
          <UserMenu />
        </div>
      </InternalHeader>
      {config?.isDevelopment && <div className={styles.indicateLocalBorder} />}
      {unsavedChangesModalContent}
    </section>
  );
};
