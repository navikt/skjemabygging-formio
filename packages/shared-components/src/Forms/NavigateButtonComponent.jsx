import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import Lenke from "nav-frontend-lenker";
import React from "react";
import { Link, useLocation } from "react-router-dom";
const linkBtnStyle = {
  textDecoration: "none",
  backgroundColor: "var(--navds-button-color-primary-background)",
  color: "var(--navds-button-color-primary-text)",
};
const NavigateButtonComponent = ({ goBackUrl, translate }) => {
  const { search } = useLocation();

  return (
    <nav className="form-nav">
      <Lenke className="navds-button navds-button--primary" style={linkBtnStyle} href="https://www.nav.no">
        {translate(TEXTS.grensesnitt.navigation.exit)}
      </Lenke>
      <Link className="navds-button navds-button--secondary" to={{ pathname: goBackUrl, search }}>
        {translate(TEXTS.grensesnitt.goBack)}
      </Link>
    </nav>
  );
};

export default NavigateButtonComponent;
