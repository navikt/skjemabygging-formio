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
          onClick={() => {
            loggNavigering({
              lenkeTekst: translate(TEXTS.grensesnitt.goBack),
              destinasjon: goBackUrl,
            });
          }}
          className="navds-button navds-button--secondary"
          to={{ pathname: goBackUrl, search }}
        >
          <span aria-live="polite" className="navds-label">
            {translate(TEXTS.grensesnitt.goBack)}
          </span>
        </Link>
      </div>
      <div className="button-row">
        <a
          className="navds-button navds-button--tertiary"
          href={exitUrl}
          onClick={() => {
            loggNavigering({
              lenkeTekst: translate(TEXTS.grensesnitt.navigation.exit),
              destinasjon: exitUrl,
            });
          }}
        >
          <span aria-live="polite" className="navds-label">
            {translate(TEXTS.grensesnitt.navigation.exit)}
          </span>
        </a>
      </div>
    </nav>
  );
};

export default NavigateButtonComponent;
