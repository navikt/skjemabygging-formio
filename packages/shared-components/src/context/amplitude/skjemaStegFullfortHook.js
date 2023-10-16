import { useEffect, useState } from 'react';
import { loggEventSkjemaStegFullfort } from '../../util/amplitude';

export default function useSkjemaStegFullfort(form) {
  const [completedSteps, setCompletedSteps] = useState({});
  const [lastCompletedStep, setLastCompletedStep] = useState({ steg: -1 });
  useEffect(() => {
    if (lastCompletedStep.steg === -1) {
      return;
    }
    if (!completedSteps[lastCompletedStep.skjemastegNokkel]) {
      loggEventSkjemaStegFullfort(form, lastCompletedStep);
      setCompletedSteps({
        ...completedSteps,
        [lastCompletedStep.skjemastegNokkel]: true,
      });
    }
  }, [completedSteps, form, lastCompletedStep]);
  return (data) => setLastCompletedStep(data);
}
