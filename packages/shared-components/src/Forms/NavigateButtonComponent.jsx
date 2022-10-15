import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import Lenke from "nav-frontend-lenker";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const linkBtnPrimaryStyle = {
  textDecoration: "none",
  backgroundColor: "var(--navds-button-color-primary-background)",
  color: "var(--navds-button-color-primary-text)",
};
const linkBtnSecondaryStyle = {
  textDecoration: "none",
  backgroundColor: "var(--navds-button-color-secondary-background)",
  color: "var(--navds-button-color-secondary-text)",
};

const NavigateButtonComponent = ({ goBackUrl, translate, secondaryOnly }) => {
  const { search } = useLocation();
  return (
    <nav className="form-nav">
      <Lenke
        className={secondaryOnly ? "navds-button navds-button--secondary" : "navds-button navds-button--primary"}
        style={secondaryOnly ? linkBtnSecondaryStyle : linkBtnPrimaryStyle}
        href="https://www.nav.no"
      >
        <span aria-live="polite" class="navds-label">
          {translate(TEXTS.grensesnitt.navigation.exit)}
        </span>
      </Lenke>
      <Link className="navds-button navds-button--secondary" to={{ pathname: goBackUrl, search }}>
        <span aria-live="polite" class="navds-label">
          {translate(TEXTS.grensesnitt.goBack)}
        </span>
      </Link>
    </nav>
  );
};

export default NavigateButtonComponent;
