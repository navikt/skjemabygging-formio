import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import Lenke from "nav-frontend-lenker";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavigateButtonComponent = ({ goBackUrl, translate }) => {
  const { search } = useLocation();

  const linkBtnStyle = {
    textDecoration: "none",
  };

  return (
    <nav className="list-inline">
      <div className="list-inline-item">
        <Link className="knapp knapp--fullbredde" to={{ pathname: goBackUrl, search }}>
          {translate(TEXTS.grensesnitt.goBack)}
        </Link>
      </div>
      <div className="list-inline-item">
        <Lenke className="knapp" style={linkBtnStyle} href="https://www.nav.no">
          {translate(TEXTS.grensesnitt.navigation.exit)}
        </Lenke>
      </div>
    </nav>
  );
};

export default NavigateButtonComponent;
