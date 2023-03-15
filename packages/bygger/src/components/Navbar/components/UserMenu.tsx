import { makeStyles } from "@material-ui/styles";
import { Dropdown, Header } from "@navikt/ds-react-internal";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { useDropdownStyles } from "../styles";

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
      <Header.UserButton as={Dropdown.Toggle} name={userData.name ? userData.name : ""} />
      <Dropdown.Menu className={dropdownStyles.dropdownMenu}>
        <Dropdown.Menu.List>
          <Dropdown.Menu.List.Item className={styles.logOutBtn}>
            {" "}
            <Link className="knapp knapp--standard knapp--mini" to="/" onClick={logout}>
              Logg ut
            </Link>
          </Dropdown.Menu.List.Item>
        </Dropdown.Menu.List>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserMenu;
