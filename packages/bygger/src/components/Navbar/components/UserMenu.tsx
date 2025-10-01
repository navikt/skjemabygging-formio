import { Dropdown, InternalHeader, Link } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Link as ReactRouterLink } from 'react-router';
import { useAuth } from '../../../context/auth-context';

const useStyles = makeStyles({
  logOutBtn: {
    width: 'auto',
    padding: '0',
    margin: '4px auto',
  },
});

const UserMenu = () => {
  const { logout, userData } = useAuth();
  const styles = useStyles();

  if (!userData) return <></>;

  return (
    <Dropdown>
      <InternalHeader.UserButton as={Dropdown.Toggle} name={userData.name ? userData.name : ''} />
      <Dropdown.Menu>
        <Dropdown.Menu.List>
          <Dropdown.Menu.List.Item className={styles.logOutBtn}>
            <Link as={ReactRouterLink} to="/" onClick={logout}>
              Logg ut
            </Link>
          </Dropdown.Menu.List.Item>
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu;
