import { useState } from "react";
import { loggSkjemaApnet } from "../../util/amplitude";

export default function useHarApnetSkjema(form) {
  const [harApnetSkjema, setHarApnetSkjema] = useState(false);
  return (innsendingsKanal) => {
    if (!harApnetSkjema) {
      loggSkjemaApnet(form, innsendingsKanal);
      setHarApnetSkjema(true);
    }
  };
}
