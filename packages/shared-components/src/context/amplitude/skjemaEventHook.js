import { useEffect, useState } from "react";
import useSkjemaStartet from "./skjemaStartetHook";
import useSkjemaSporsmalBesvart from "./skjemaSporsmalBesvartHook";

export default function useSkjemaSporsmalEvent(form) {
  const [lastSporsmalEvent, setLastSporsmalEvent] = useState(null);
  const loggSkjemaStartet = useSkjemaStartet(form);
  const loggSkjemaSporsmalBesvart = useSkjemaSporsmalBesvart(form);
  const loggSkjemaSporsmalBesvartForSpesialFelter = (event) => {
    if (
      event.changed &&
      ["radio", "checkbox", "navDatepicker", "day", "radiopanel", "navCheckbox"].includes(event.changed.component.type)
    ) {
      setLastSporsmalEvent({
        component: event.changed.component,
        _data: event.data,
      });
    }
  };

  useEffect(() => {
    loggSkjemaStartet(lastSporsmalEvent);
    loggSkjemaSporsmalBesvart(lastSporsmalEvent);
  }, [lastSporsmalEvent, loggSkjemaSporsmalBesvart, loggSkjemaStartet]);

  return {
    loggSkjemaSporsmalBesvart: setLastSporsmalEvent,
    loggSkjemaSporsmalBesvartForSpesialFelter,
  };
}
