import { useEffect, useState } from "react";
import useSkjemaStartet from "./skjemaStartetHook";
import useSkjemaSporsmalBesvart from "./skjemaSporsmalBesvartHook";

export default function useSkjemaSporsmalEvent(form) {
  const [lastSporsmalEvent, setLastSporsmalEvent] = useState(null);
  const loggSkjemaStartet = useSkjemaStartet(form);
  const loggSkjemaSporsmalBesvart = useSkjemaSporsmalBesvart(form);

  useEffect(() => {
    loggSkjemaStartet(lastSporsmalEvent);
    loggSkjemaSporsmalBesvart(lastSporsmalEvent);
  }, [lastSporsmalEvent, loggSkjemaSporsmalBesvart, loggSkjemaStartet]);

  return setLastSporsmalEvent;
}
