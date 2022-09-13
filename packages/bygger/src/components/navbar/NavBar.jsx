import { makeStyles } from "@material-ui/styles";
import { HomeFilled, People, System } from "@navikt/ds-icons";
import { Dropdown, Header } from "@navikt/ds-react-internal";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth-context";
import { FormMenu } from "./FormMenu";
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
    backgroundColor: "#003260",
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
  dropdownMenu: {
    top: "56px !important",
  },
  userButton: {
    "@media (max-width: 1040px)": {
      display: "none",
    },
  },
  userButtonResponsive: {
    display: "none",
    "@media (max-width: 1040px)": {
      display: "flex",
    },
  },
  logOutBtn: {
    width: "auto",
    padding: "0",
    margin: "4px auto",
  },
});

export const NavBar = ({ title, visSkjemaliste, formPath, visSkjemaMeny, visOversettelsesMeny, translateLinks }) => {
  const { logout, userData } = useAuth();
  const { featureToggles, config } = useAppConfig();
  const styles = useStyles();
  return (
    <section>
      <Header className={config?.isDevelopment ? styles.navBarLocal : styles.navBar}>
        <Link className={styles.formsLink} to="/forms" aria-label="Gå til skjemaliste">
          <HomeFilled style={{ color: "#ffffff", fontSize: "1.5rem" }} alt="Skjemaliste" />
        </Link>
        <div className={styles.navBarLinks}>
          {visSkjemaMeny && <FormMenu formPath={formPath} />}
          {visOversettelsesMeny && <TranslationsMenu formPath={formPath} />}
        </div>
        <div className={styles.headerMenus}>
          <Dropdown>
            <Header.Button as={Dropdown.Toggle} className="ml-auto" aria-label="Åpne meny">
              <System style={{ fontSize: "1.5rem" }} title="Meny" />
            </Header.Button>
            <Dropdown.Menu className={styles.dropdownMenu}>
              <Dropdown.Menu.GroupedList>
                <Dropdown.Menu.GroupedList.Item>
                  {" "}
                  {featureToggles.enableTranslations && (
                    <Link to="/translations/global/nn-NO/skjematekster">Globale Oversettelser</Link>
                  )}
                </Dropdown.Menu.GroupedList.Item>
                <Dropdown.Menu.GroupedList.Item>
                  {" "}
                  <Link to="/migrering">Migrering</Link>
                </Dropdown.Menu.GroupedList.Item>
                <Dropdown.Menu.GroupedList.Item>
                  {" "}
                  <Link to="/mottaksadresser">Rediger mottaksadresser</Link>
                </Dropdown.Menu.GroupedList.Item>
              </Dropdown.Menu.GroupedList>
            </Dropdown.Menu>
          </Dropdown>
          {!!userData && (
            <Dropdown>
              <Header.UserButton
                className={styles.userButton}
                as={Dropdown.Toggle}
                name={userData ? userData.name : "Ukjent brukernavn"}
              />
              <Header.UserButton
                as={Dropdown.Toggle}
                className={styles.userButtonResponsive}
                name={<People style={{ fontSize: "1.5rem" }} alt="Skjemaliste" />}
              ></Header.UserButton>
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
    </section>
  );
};
