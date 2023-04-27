import { useState } from "react";
import { loggEventSkjemaApnet } from "../../util/amplitude";

export default function useHarApnetSkjema(form) {
  const [harApnetSkjema, setHarApnetSkjema] = useState(false);
  return (innsendingsKanal) => {
    if (!harApnetSkjema) {
      loggEventSkjemaApnet(form, innsendingsKanal);
      setHarApnetSkjema(true);
    }
  };
}
