import { useEffect, useState } from "react";
import useSkjemaSporsmalBesvart from "./skjemaSporsmalBesvartHook";
import useSkjemaStartet from "./skjemaStartetHook";

export default function useSkjemaSporsmalEvent(form) {
  const [lastSporsmalEvent, setLastSporsmalEvent] = useState(null);
  const loggSkjemaStartet = useSkjemaStartet(form);
  const loggSkjemaSporsmalBesvart = useSkjemaSporsmalBesvart(form);
  const loggSkjemaSporsmalBesvartForSpesialTyper = (event) => {
    if (
      event.changed &&
      ["radio", "checkbox", "navDatepicker", "day", "radiopanel", "navCheckbox", "navSelect"].includes(
        event.changed.component.type
      )
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
    loggSkjemaSporsmalBesvartForSpesialTyper,
  };
}
