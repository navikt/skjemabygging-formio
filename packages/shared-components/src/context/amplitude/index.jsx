import React, { createContext, useContext, useEffect } from "react";
import {
  initAmplitude,
  loggSkjemaFullfort,
  loggSkjemaInnsendingFeilet,
  loggSkjemaValideringFeilet,
} from "../../util/amplitude";
import useHarApnetSkjema from "./harApnetSkjemaHook";
import useSkjemaSporsmalEvent from "./skjemaEventHook";
import useSkjemaStegFullfort from "./skjemaStegFullfortHook";

const defaultValues = {
  loggSkjemaApnet: () => {},
  loggSkjemaSporsmalBesvart: (event) => {},
  loggSkjemaSporsmalForSpesialTyper: (event) => {},
  loggSkjemaStegFullfort: (steg) => {},
  loggSkjemaValideringFeilet: () => {},
  loggSkjemaInnsendingFeilet: () => {},
  loggSkjemaFullfort: (innsendingsType) => {},
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
