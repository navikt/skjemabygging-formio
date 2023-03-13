import { makeStyles } from "@material-ui/styles";
import { HomeFilled, System } from "@navikt/ds-icons";
import { Dropdown, Header } from "@navikt/ds-react-internal";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { FormMenu } from "./FormMenu";
import NotificationDropdown from "./NotificationDropdown";
import { TranslationsMenu } from "./TranslationsMenu";

const useStyles = makeStyles({
  navBar: {
    height: "56px",
    justifyContent: "center",
    position: "relative",
    "@media (max-width: 1040px)": {
      justifyContent: "space-between",
    },
  },
  navBarLocal: {
    height: "56px",
    justifyContent: "center",
    position: "relative",
    "@media (max-width: 1040px)": {
      justifyContent: "space-between",
    },
  },
  formsLink: {
    height: "100%",
    position: "absolute",
    left: "0",
    display: "flex",
    alignItems: "center",
    marginRight: "auto",
    padding: "0 30px",
    color: "#ffffff",
    "@media (max-width: 1040px)": {
      position: "relative",
      flexGrow: "1",
    },
  },
  navBarLinks: {
    height: "100%",
    display: "flex",
  },
  headerMenus: {
    height: "100%",
    position: "absolute",
    right: "0",
    display: "flex",
    "@media (max-width: 1040px)": {
      position: "relative",
    },
  },
  navBarLinkIcon: {
    fontSize: "1.5rem",
  },
  dropdownMenu: {
    top: "56px !important",
  },
  logOutBtn: {
    width: "auto",
    padding: "0",
    margin: "4px auto",
  },
  indicateLocalBorder: {
    height: "10px",
    width: "100%",
    background:
      "linear-gradient(90deg,rgba(255, 0, 0, 1) 0%, rgba(255, 154, 0, 1) 10%,rgba(208, 222, 33, 1) 20%,rgba(79, 220, 74, 1) 30%,rgba(63, 218, 216, 1) 40%,rgba(47, 201, 226, 1) 50%,rgba(28, 127, 238, 1) 60%,  rgba(95, 21, 242, 1) 70%,rgba(186, 12, 248, 1) 80%,rgba(251, 7, 217, 1) 90%,rgba(255, 0, 0, 1) 100%)",
    opacity: "0.5",
  },
});

interface Props {
  formPath: string;
  visSkjemaMeny: boolean;
  visOversettelsesMeny: boolean;
}

export const NavBar = ({ formPath, visSkjemaMeny, visOversettelsesMeny }: Props) => {
  const { logout, userData } = useAuth();
  const { config } = useAppConfig();
  const styles = useStyles();
  const showAdmin = userData?.isAdmin;
  return (
    <section>
      <Header className={config?.isDevelopment ? styles.navBarLocal : styles.navBar}>
        <Link className={styles.formsLink} to="/forms" aria-label="Gå til skjemaliste">
          <HomeFilled className={styles.navBarLinkIcon} role="presentation" />
        </Link>
        <div className={styles.navBarLinks}>
          {visSkjemaMeny && <FormMenu formPath={formPath} />}
          {visOversettelsesMeny && <TranslationsMenu />}
        </div>
        <div className={styles.headerMenus}>
          <NotificationDropdown />
          {showAdmin && (
            <Dropdown>
              <Header.Button as={Dropdown.Toggle} className="ml-auto" aria-label="Åpne meny">
                <System className={styles.navBarLinkIcon} role="presentation" />
              </Header.Button>
              <Dropdown.Menu className={styles.dropdownMenu}>
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
          )}
          {!!userData && (
            <Dropdown>
              <Header.UserButton as={Dropdown.Toggle} name={userData.name ? userData.name : ""} />
              <Dropdown.Menu className={styles.dropdownMenu}>
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
          )}
        </div>
      </Header>
      {config?.isDevelopment && <div className={styles.indicateLocalBorder} />}
    </section>
  );
};
