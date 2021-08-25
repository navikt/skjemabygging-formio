import React from "react";
import { makeStyles } from "@material-ui/styles";
import { Link } from "react-router-dom";
import navCssVariables from "nav-frontend-core";
import { Undertittel } from "nav-frontend-typografi";
import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import Row from "./layout/Row";

const useStyles = makeStyles({
  navBar: {
    backgroundColor: navCssVariables.navDypBlaLighten40,
    color: "#fff",
    padding: "1.5rem 0",
  },
  title: {
    textAlign: "center",
    gridColumn: "2 / 3",
  },
});

export const NavBar = ({ title, logout, visSkjemaliste, visOversettelseliste }) => {
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
        <Undertittel className={styles.title}>{title}</Undertittel>
        <Link className="knapp knapp--standard knapp--mini" to="/" onClick={logout}>
          Logg ut
        </Link>
      </Row>
    </section>
  );
};
