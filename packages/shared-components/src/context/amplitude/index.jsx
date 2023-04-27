import { createContext, useContext, useEffect } from "react";
import {
  initAmplitude,
  loggEventDokumentLastetNed,
  loggSkjemaFullfort,
  loggSkjemaInnsendingFeilet,
  loggSkjemaValideringFeilet,
} from "../../util/amplitude";
import useHarApnetSkjema from "./harApnetSkjemaHook";
import useSkjemaSporsmalEvent from "./skjemaEventHook";
import useSkjemaStegFullfort from "./skjemaStegFullfortHook";

const defaultValues = {
  loggSkjemaApnet: (innsendingsKanal) => {},
  loggSkjemaSporsmalBesvart: (event) => {},
  loggSkjemaSporsmalForSpesialTyper: (event) => {},
  loggSkjemaStegFullfort: (data) => {},
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
        loggSkjemaApnet: (innsendingsKanal) => loggApnetSkjema(innsendingsKanal),
        loggSkjemaSporsmalBesvart: (event) => loggSkjemaSporsmalBesvart(event),
        loggSkjemaSporsmalForSpesialTyper: (event) => loggSkjemaSporsmalBesvartForSpesialFelter(event),
        loggSkjemaStegFullfort: (data) => loggSkjemaStegFullfort(data),
        loggDokumentLastetNed: (tittel) => loggEventDokumentLastetNed(form, tittel),
        loggSkjemaValideringFeilet: () => loggSkjemaValideringFeilet(form),
        loggSkjemaInnsendingFeilet: () => loggSkjemaInnsendingFeilet(form),
        loggSkjemaFullfort: () => loggSkjemaFullfort(form),
      }
    : defaultValues;
  return <AmplitudeContext.Provider value={amplitude}>{children}</AmplitudeContext.Provider>;
}

export const useAmplitude = () => useContext(AmplitudeContext);

export default AmplitudeProvider;
