import { makeStyles } from "@material-ui/styles";
import { navCssVariables, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import Row from "./layout/Row";

const useStyles = makeStyles({
  navBar: {
    backgroundColor: navCssVariables.navDypBlaLighten40,
    color: "#fff",
    padding: "1.5rem 2rem",
  },
  title: {
    textAlign: "center",
    gridColumn: "2 / 3",
  },
});

export const NavBar = ({ title, visSkjemaliste, visOversettelseliste }) => {
  const { logout } = useAuth();
  const { featureToggles } = useAppConfig();
  const styles = useStyles();
  return (
    <section className={styles.navBar}>
      <Row>
        {visSkjemaliste && (
          <Link className="knapp knapp--standard knapp--mini" to="/forms">
            Skjemaliste
          </Link>
        )}
        {featureToggles.enableTranslations && visOversettelseliste && (
          <Link className="knapp knapp--standard knapp--mini" to="/translations">
            Oversettelser
          </Link>
        )}
        <Undertittel className={styles.title} tag="h1">
          {title}
        </Undertittel>
        <Link className="knapp knapp--standard knapp--mini" to="/" onClick={logout}>
          Logg ut
        </Link>
      </Row>
    </section>
  );
};
