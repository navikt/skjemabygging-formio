import { useState } from 'react';
import { loggEventSkjemaApnet } from '../../util/amplitude';

export default function useHarApnetSkjema(form) {
  const [harApnetSkjema, setHarApnetSkjema] = useState(false);
  return (innsendingskanal) => {
    if (!harApnetSkjema) {
      loggEventSkjemaApnet(form, innsendingskanal);
      setHarApnetSkjema(true);
    }
  };
}
