import { useEffect, useState } from "react";
import { loggEventSkjemaStartet } from "../../util/amplitude";

export default function useSkjemaStartet(form) {
  const [lastEvent, setLastEvent] = useState(null);
  const [harStartetUfylling, setHarStartetUtfylling] = useState(false);
  useEffect(() => {
    if (lastEvent && lastEvent._data[lastEvent.component.key] && !harStartetUfylling) {
      loggEventSkjemaStartet(form);
      setHarStartetUtfylling(true);
    }
  }, [form, harStartetUfylling, lastEvent]);
  return setLastEvent;
}
