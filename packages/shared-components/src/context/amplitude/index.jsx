import { createContext, useContext, useEffect } from "react";
import {
  initAmplitude,
  loggEventDokumentLastetNed,
  loggEventFilterValg,
  loggEventNavigere,
  loggEventSkjemaFullfort,
  loggEventSkjemaInnsendingFeilet,
  loggEventSkjemaValideringFeilet,
} from "../../util/amplitude";
import useHarApnetSkjema from "./harApnetSkjemaHook";
import useSkjemaSporsmalEvent from "./skjemaEventHook";
import useSkjemaStegFullfort from "./skjemaStegFullfortHook";

const defaultValues = {
  loggSkjemaApnet: (innsendingsKanal) => {},
  loggSkjemaSporsmalBesvart: (event) => {},
  loggSkjemaSporsmalBesvartForSpesialTyper: (event) => {},
  loggSkjemaStegFullfort: (data) => {},
  loggSpraakValg: (spraak) => {},
  loggDokumentLastetNed: (tittel) => {},
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
  const loggSkjemaApnet = useHarApnetSkjema(form);
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalBesvartForSpesialTyper } = useSkjemaSporsmalEvent(form);

  const amplitude = shouldUseAmplitude
    ? {
        loggSkjemaApnet,
        loggSkjemaSporsmalBesvart,
        loggSkjemaSporsmalBesvartForSpesialTyper,
        loggSkjemaStegFullfort,
        loggSpraakValg: (spraak) => loggEventFilterValg(form, { kategori: "språk", filternavn: spraak }),
        loggNavigeringViaLenke: (data) => loggEventNavigere(form, data),
        loggDokumentLastetNed: (tittel) => loggEventDokumentLastetNed(form, tittel),
        loggSkjemaValideringFeilet: () => loggEventSkjemaValideringFeilet(form),
        loggSkjemaInnsendingFeilet: () => loggEventSkjemaInnsendingFeilet(form),
        loggSkjemaFullfort: () => loggEventSkjemaFullfort(form),
      }
    : defaultValues;
  return <AmplitudeContext.Provider value={amplitude}>{children}</AmplitudeContext.Provider>;
}

export const useAmplitude = () => useContext(AmplitudeContext);

export default AmplitudeProvider;
