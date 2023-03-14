import { System } from "@navikt/ds-icons";
import { Dropdown, Header } from "@navikt/ds-react-internal";
import React from "react";
import { Link } from "react-router-dom";
import { useDropdownStyles } from "../styles";

const AdminMenu = () => {
  const dropdownStyles = useDropdownStyles();
  return (
    <Dropdown>
      <Header.Button as={Dropdown.Toggle} className="ml-auto" aria-label="Åpne meny">
        <System fontSize={"1.5rem"} role="presentation" />
      </Header.Button>
      <Dropdown.Menu className={dropdownStyles.dropdownMenu}>
        <Dropdown.Menu.GroupedList>
          <Dropdown.Menu.GroupedList.Item>
            {" "}
            <Link to="/translations/global/nn-NO/skjematekster">Globale Oversettelser</Link>
          </Dropdown.Menu.GroupedList.Item>
          <Dropdown.Menu.GroupedList.Item>
            {" "}
            <Link to="/migrering">Migrering</Link>
          </Dropdown.Menu.GroupedList.Item>
          <Dropdown.Menu.GroupedList.Item>
            {" "}
            <Link to="/mottaksadresser">Rediger mottaksadresser</Link>
          </Dropdown.Menu.GroupedList.Item>

          <Dropdown.Menu.GroupedList.Item>
            {" "}
            <Link to="/rapporter">Rapporter</Link>
          </Dropdown.Menu.GroupedList.Item>
        </Dropdown.Menu.GroupedList>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default AdminMenu;
