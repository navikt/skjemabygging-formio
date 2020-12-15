import React, { createContext, useContext, useEffect, useState } from "react";
import { Formio } from "formiojs";
import {
  loggSkjemaApnet,
  loggSkjemaStartet,
  loggSkjemaSporsmalBesvart,
  loggSkjemaInnsendingFeilet,
  loggSkjemaValideringFeilet,
  initAmplitude,
  loggSkjemaFullfort,
  loggSkjemaStegFullfort,
} from "../util/amplitude";

const defaultValues = {
  loggSkjemaApnet: () => {},
  loggSkjemaStartet: () => {},
  loggSkjemaSporsmalBesvart: () => {},
  loggSkjemaStegFullfort: () => {},
  loggSkjemaInnsendingFeilet: () => {},
  loggSkjemaValideringFeilet: () => {},
  loggSkjemaFullfort: () => {},
};

const AmplitudeContext = createContext(defaultValues);

const hasFieldValueChanged = (previousValue, newValue) => previousValue !== newValue;

function AmplitudeProvider({ children, form, shouldUseAmplitude }) {
  useEffect(() => {
    if (shouldUseAmplitude) {
      initAmplitude();
    }
  }, [shouldUseAmplitude]);
  const initialCompletedSteps = form.components.reduce((acc, curr, index) => ({ ...acc, [index + 1]: false }), {});
  const [harApnetSkjema, setHarApnetSkjema] = useState(false);
  const [harStartetUfylling, setHarStartetUtfylling] = useState(false);
  const [completedSteps, setCompletedSteps] = useState(initialCompletedSteps);
  const [lastCompletedStep, setLastCompletedStep] = useState(-1);
  useEffect(() => {
    if (lastCompletedStep === -1) {
      return;
    }
    if (!completedSteps[lastCompletedStep]) {
      loggSkjemaStegFullfort(form, lastCompletedStep);
      setCompletedSteps({
        ...completedSteps,
        [lastCompletedStep]: true,
      });
    }
  }, [completedSteps, form, lastCompletedStep]);

  const [hasStartedFillingOutForm, setHasStartedFillingOutForm] = useState(false);
  const [lastFormState, setLastFormState] = useState({});
  const [lastEvent, setLastEvent] = useState(null);
  useEffect(() => {
    if (lastEvent && lastEvent._data[lastEvent.component.key] && !hasStartedFillingOutForm) {
      loggSkjemaStartet(form);
      setHasStartedFillingOutForm(true);
    }
  }, [form, hasStartedFillingOutForm, lastEvent]);
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

  const amplitude = shouldUseAmplitude
    ? {
        loggSkjemaApnet: () => {
          if (!harApnetSkjema) {
            loggSkjemaApnet(form);
            setHarApnetSkjema(true);
          }
        },
        loggSkjemaStartet: () => {
          if (!harStartetUfylling) {
            loggSkjemaStartet(form);
            setHarStartetUtfylling(true);
          }
        },
        loggSkjemaStegFullfort: (steg = Formio.forms[Object.keys(Formio.forms)[0]].page) => setLastCompletedStep(steg),
        // loggSkjemaSporsmalBesvart: (sporsmal, id, svar, pakrevd) =>
        //  loggSkjemaSporsmalBesvart(form, sporsmal, id, svar, pakrevd),
        loggSkjemaSporsmalBesvart: (event) => setLastEvent(event),
        loggSkjemaInnsendingFeilet: () => loggSkjemaInnsendingFeilet(form),
        loggSkjemaValideringFeilet: () => loggSkjemaValideringFeilet(form),
        loggSkjemaFullfort: (innsendingsType) => loggSkjemaFullfort(form, innsendingsType),
      }
    : defaultValues;
  return <AmplitudeContext.Provider value={amplitude}>{children}</AmplitudeContext.Provider>;
}

export const useAmplitude = () => useContext(AmplitudeContext);

export default AmplitudeProvider;
