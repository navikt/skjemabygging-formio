import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React from "react";
import { Link, useLocation } from "react-router-dom";

const NavigateButtonComponent = ({ goBackUrl, translate }) => {
  const { search } = useLocation();
  return (
    <nav>
      <div className="button-row">
        <Link className="navds-button navds-button--secondary" to={{ pathname: goBackUrl, search }}>
          <span aria-live="polite" className="navds-label">
            {translate(TEXTS.grensesnitt.goBack)}
          </span>
        </Link>
      </div>
      <div className="button-row">
        <a className="navds-button navds-button--tertiary" href="https://www.nav.no">
          <span aria-live="polite" className="navds-label">
            {translate(TEXTS.grensesnitt.navigation.exit)}
          </span>
        </a>
      </div>
    </nav>
  );
};

export default NavigateButtonComponent;
