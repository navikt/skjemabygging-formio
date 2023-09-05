import { makeStyles } from "@navikt/skjemadigitalisering-shared-components";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { useDropdownStyles } from "../styles";
import { Dropdown, InternalHeader } from "@navikt/ds-react";

const useStyles = makeStyles({
  logOutBtn: {
    width: "auto",
    padding: "0",
    margin: "4px auto",
  },
});

const UserMenu = () => {
  const { logout, userData } = useAuth();
  const styles = useStyles();
  const dropdownStyles = useDropdownStyles();

  if (!userData) return <></>;

  return (
    <Dropdown>
      <InternalHeader.UserButton as={Dropdown.Toggle} name={userData.name ? userData.name : ""} />
      <Dropdown.Menu className={dropdownStyles.dropdownMenu}>
        <Dropdown.Menu.List>
          <Dropdown.Menu.List.Item className={styles.logOutBtn}>
            {" "}
            <Link className="navds-button navds-button--secondary navds-button--small" to="/" onClick={logout}>
              Logg ut
            </Link>
          </Dropdown.Menu.List.Item>
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu;
