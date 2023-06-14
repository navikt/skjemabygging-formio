import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Link, useLocation } from "react-router-dom";
import { useAmplitude } from "../context/amplitude/index.jsx";

const NavigateButtonComponent = ({ goBackUrl, translate }) => {
  const { search } = useLocation();
  const { loggNavigering } = useAmplitude();
  const exitUrl = "https://www.nav.no";
  return (
    <nav>
      <div className="button-row">
        <Link
          className="navds-button navds-button--secondary"
          onClick={() => {
            loggNavigering({
              lenkeTekst: translate(TEXTS.grensesnitt.goBack),
              destinasjon: goBackUrl,
            });
          }}
          to={{ pathname: goBackUrl, search }}
        >
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.goBack)}
          </span>
        </Link>
      </div>
      <div className="button-row">
        <a
          className="navds-button navds-button--tertiary"
          onClick={() => {
            loggNavigering({
              lenkeTekst: translate(TEXTS.grensesnitt.navigation.exit),
              destinasjon: exitUrl,
            });
          }}
          href="https://www.nav.no"
        >
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.navigation.exit)}
          </span>
        </a>
      </div>
    </nav>
  );
};

export default NavigateButtonComponent;
