import { createContext, useContext, useEffect } from 'react';
import {
  initAmplitude,
  loggEventDokumentLastetNed,
  loggEventFilterValg,
  loggEventNavigere,
  loggEventSkjemaFullfort,
  loggEventSkjemaInnsendingFeilet,
  loggEventSkjemaValideringFeilet,
} from '../../util/amplitude/amplitude';
import { useAppConfig } from '../config/configContext';
import useHarApnetSkjema from './hooks/harApnetSkjemaHook';
import useSkjemaSporsmalEvent from './hooks/skjemaEventHook';
import useSkjemaStegFullfort from './hooks/skjemaStegFullfortHook';

const defaultValues = {
  loggSkjemaApnet: (_innsendingsKanal) => {},
  loggSkjemaSporsmalBesvart: (_event) => {},
  loggSkjemaStegFullfort: (_data) => {},
  loggSpraakValg: (_spraak) => {},
  loggNavigering: (_data) => {},
  loggDokumentLastetNed: (_tittel) => {},
  loggSkjemaValideringFeilet: () => {},
  loggSkjemaInnsendingFeilet: () => {},
  loggSkjemaFullfort: () => Promise.resolve(),
};

const AmplitudeContext = createContext(defaultValues);

function AmplitudeProvider({ children, form }) {
  const { config } = useAppConfig();
  useEffect(() => {
    if (config.amplitudeApiEndpoint) {
      initAmplitude(config.amplitudeApiEndpoint, config.amplitudeDisableBatch);
    }
  }, [config]);
  const loggSkjemaStegFullfort = useSkjemaStegFullfort(form);
  const loggSkjemaApnet = useHarApnetSkjema(form);
  const { loggSkjemaSporsmalBesvart } = useSkjemaSporsmalEvent(form);

  const amplitude = config.amplitudeApiEndpoint
    ? {
        loggSkjemaApnet,
        loggSkjemaSporsmalBesvart,
        loggSkjemaStegFullfort,
        loggSpraakValg: (spraak) => loggEventFilterValg(form, { kategori: 'språk', filternavn: spraak }),
        loggNavigering: (data) => loggEventNavigere(form, data),
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
