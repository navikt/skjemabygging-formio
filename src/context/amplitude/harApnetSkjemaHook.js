import { useState } from "react";
import { loggSkjemaApnet } from "../../util/amplitude";

export default function useHarApnetSkjema(form) {
  const [harApnetSkjema, setHarApnetSkjema] = useState(false);
  return () => {
    if (!harApnetSkjema) {
      loggSkjemaApnet(form);
      setHarApnetSkjema(true);
    }
  };
}
