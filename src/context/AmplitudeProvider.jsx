import React, { createContext, useContext, useEffect } from "react";
import {
  loggSkjemaApnet,
  loggSkjemaStartet,
  loggSkjemaSporsmalBesvart,
  loggSkjemaInnsendingFeilet,
  loggSkjemaValideringFeilet,
  initAmplitude,
  loggSkjemaFullfort,
} from "../util/amplitude";

const defaultValues = {
  loggSkjemaApnet: () => {},
  loggSkjemaStartet: () => {},
  loggSkjemaSporsmalBesvart: () => {},
  loggSkjemaInnsendingFeilet: () => {},
  loggSkjemaValideringFeilet: () => {},
  loggSkjemaFullfort: () => {},
};

const AmplitudeContext = createContext(defaultValues);

function AmplitudeProvider({ children, form, shouldUseAmplitude }) {
  useEffect(() => {
    if (shouldUseAmplitude) {
      initAmplitude();
    }
  }, [shouldUseAmplitude]);
  const amplitude = shouldUseAmplitude
    ? {
        loggSkjemaApnet: () => loggSkjemaApnet(form),
        loggSkjemaStartet: () => loggSkjemaStartet(form),
        loggSkjemaSporsmalBesvart: (sporsmal, id, svar, pakrevd) =>
          loggSkjemaSporsmalBesvart(form, sporsmal, id, svar, pakrevd),
        loggSkjemaInnsendingFeilet: () => loggSkjemaInnsendingFeilet(form),
        loggSkjemaValideringFeilet: () => loggSkjemaValideringFeilet(form),
        loggSkjemaFullfort: (innsendingsType) => loggSkjemaFullfort(form, innsendingsType),
      }
    : defaultValues;
  return <AmplitudeContext.Provider value={amplitude}>{children}</AmplitudeContext.Provider>;
}

export const useAmplitude = () => useContext(AmplitudeContext);

export default AmplitudeProvider;
