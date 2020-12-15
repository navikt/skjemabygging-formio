import React, { createContext, useContext, useEffect, useState } from "react";
import { Formio } from "formiojs";
import {
  loggSkjemaInnsendingFeilet,
  loggSkjemaValideringFeilet,
  initAmplitude,
  loggSkjemaFullfort,
} from "../util/amplitude";
import useHarApnetSkjema from "./amplitude/harApnetSkjemaHook";
import useSkjemaStegFullfort from "./amplitude/skjemaStegFullfortHook";
import useSkjemaSporsmalEvent from "./amplitude/skjemaEventHook";

const defaultValues = {
  loggSkjemaApnet: () => {},
  loggSkjemaSporsmalBesvart: () => {},
  loggSkjemaStegFullfort: () => {},
  loggSkjemaValideringFeilet: () => {},
  loggSkjemaInnsendingFeilet: () => {},
  loggSkjemaFullfort: () => {},
};

const AmplitudeContext = createContext(defaultValues);

function AmplitudeProvider({ children, form, shouldUseAmplitude }) {
  useEffect(() => {
    if (shouldUseAmplitude) {
      initAmplitude();
    }
  }, [shouldUseAmplitude]);
  const loggSkjemaStegFullfort = useSkjemaStegFullfort(form);
  const loggApnetSkjema = useHarApnetSkjema(form);
  const loggSkjemaSporsmalEvent = useSkjemaSporsmalEvent(form);

  const amplitude = shouldUseAmplitude
    ? {
        loggSkjemaApnet: () => loggApnetSkjema(),
        loggSkjemaSporsmalBesvart: (event) => loggSkjemaSporsmalEvent(event),
        loggSkjemaStegFullfort: (steg) => loggSkjemaStegFullfort(steg),
        loggSkjemaValideringFeilet: () => loggSkjemaValideringFeilet(form),
        loggSkjemaInnsendingFeilet: () => loggSkjemaInnsendingFeilet(form),
        loggSkjemaFullfort: (innsendingsType) => loggSkjemaFullfort(form, innsendingsType),
      }
    : defaultValues;
  return <AmplitudeContext.Provider value={amplitude}>{children}</AmplitudeContext.Provider>;
}

export const useAmplitude = () => useContext(AmplitudeContext);

export default AmplitudeProvider;
