import { useEffect, useState } from "react";
import { loggSkjemaStegFullfort } from "../../util/amplitude";
import { Formio } from "formiojs";

export default function useSkjemaStegFullfort(form) {
  const [completedSteps, setCompletedSteps] = useState({});
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
  return (steg = Object.values(Formio.forms).find((form) => form.page > 0).page) => setLastCompletedStep(steg);
}
