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

function AmplitudeProvider({ children, form, shouldUseAmplitude }) {
  useEffect(() => {
    if (shouldUseAmplitude) {
      initAmplitude();
    }
  }, [shouldUseAmplitude]);
  const initialCompletedSteps = form.components.reduce((acc, curr, index) => ({ ...acc, [index + 1]: false }), {});
  const [harApnetSkjema, setHarApnetSkjema] = useState(false);
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

  const amplitude = shouldUseAmplitude
    ? {
        loggSkjemaStartet: () => loggSkjemaStartet(form),
        loggSkjemaSporsmalBesvart: (sporsmal, id, svar, pakrevd) =>
          loggSkjemaSporsmalBesvart(form, sporsmal, id, svar, pakrevd),
        loggSkjemaApnet: () => {
          if (!harApnetSkjema) {
            loggSkjemaApnet(form);
            setHarApnetSkjema(true);
          }
        },
        loggSkjemaStegFullfort: (steg = Formio.forms[Object.keys(Formio.forms)[0]].page) => setLastCompletedStep(steg),
        loggSkjemaInnsendingFeilet: () => loggSkjemaInnsendingFeilet(form),
        loggSkjemaValideringFeilet: () => loggSkjemaValideringFeilet(form),
        loggSkjemaFullfort: (innsendingsType) => loggSkjemaFullfort(form, innsendingsType),
      }
    : defaultValues;
  return <AmplitudeContext.Provider value={amplitude}>{children}</AmplitudeContext.Provider>;
}

export const useAmplitude = () => useContext(AmplitudeContext);

export default AmplitudeProvider;
