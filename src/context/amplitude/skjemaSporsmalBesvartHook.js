import { useEffect, useState } from "react";
import { loggSkjemaSporsmalBesvart } from "../../util/amplitude";

const hasFieldValueChanged = (previousValue, newValue) => previousValue !== newValue;

export default function useSkjemaSporsmalBesvart(form) {
  const [lastFormState, setLastFormState] = useState({});
  const [lastEvent, setLastEvent] = useState(null);
  useEffect(() => {
    if (lastEvent) {
      const componentKey = lastEvent.component.key;
      if (hasFieldValueChanged(lastFormState[componentKey], lastEvent._data[componentKey])) {
        setLastFormState({ ...lastEvent._data });
        loggSkjemaSporsmalBesvart(
          form,
          lastEvent.component.label,
          lastEvent.component.key,
          lastEvent._data[componentKey],
          lastEvent.component.validate.required
        );
      }
    }
  }, [form, lastEvent, lastFormState]);
  return setLastEvent;
}
