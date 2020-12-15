import React, { createContext, useContext, useEffect, useState } from "react";
import { Formio } from "formiojs";
import {
  loggSkjemaInnsendingFeilet,
  loggSkjemaValideringFeilet,
  initAmplitude,
  loggSkjemaFullfort,
} from "../../util/amplitude";
import useHarApnetSkjema from "./harApnetSkjemaHook";
import useSkjemaStegFullfort from "./skjemaStegFullfortHook";
import useSkjemaSporsmalEvent from "./skjemaEventHook";

const defaultValues = {
  loggSkjemaApnet: () => {},
  loggSkjemaSporsmalBesvart: () => {},
  loggSkjemaSporsmalForSpesialTyper: () => {},
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
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalBesvartForSpesialFelter } = useSkjemaSporsmalEvent(form);

  const amplitude = shouldUseAmplitude
    ? {
        loggSkjemaApnet: () => loggApnetSkjema(),
        loggSkjemaSporsmalBesvart: (event) => loggSkjemaSporsmalBesvart(event),
        loggSkjemaSporsmalForSpesialTyper: (event) => loggSkjemaSporsmalBesvartForSpesialFelter(event),
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
