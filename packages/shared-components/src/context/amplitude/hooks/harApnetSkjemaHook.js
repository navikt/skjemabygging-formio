import { useRef } from 'react';
import { loggEventSkjemaApnet } from '../../../util/amplitude/amplitude';

export default function useHarApnetSkjema(form) {
  const harApnetSkjema = useRef(false);
  return (innsendingskanal) => {
    if (!harApnetSkjema.current) {
      harApnetSkjema.current = true;
      loggEventSkjemaApnet(form, innsendingskanal);
    }
  };
}
