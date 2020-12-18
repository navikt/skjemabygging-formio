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
  // Defaulting steg to the page of the current form, looked up by the one with page !== 0.
  return (steg = Object.values(Formio.forms).find((someForm) => someForm.page > 0).page) => setLastCompletedStep(steg);
}
