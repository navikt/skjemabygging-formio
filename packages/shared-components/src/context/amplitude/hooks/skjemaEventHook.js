import { useCallback, useRef } from 'react';
import { loggEventSkjemaSporsmalBesvart, loggEventSkjemaStartet } from '../../../util/amplitude/amplitude';

export default function useSkjemaSporsmalEvent(form) {
  const skjemaStartet = useRef(false);

  const loggSkjemaSporsmalBesvart = useCallback(
    (event) => {
      const { component, value } = event;
      if (component.input && value) {
        if (!skjemaStartet.current) {
          skjemaStartet.current = true;
          loggEventSkjemaStartet(form);
        }
        loggEventSkjemaSporsmalBesvart(form, component.label, component.key, value, component.validate.required);
      }
    },
    [form],
  );

  return {
    loggSkjemaSporsmalBesvart,
  };
}
