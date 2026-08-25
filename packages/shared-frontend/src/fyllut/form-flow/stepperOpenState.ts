const STEPPER_OPEN_STATE_STORAGE_KEY = 'fyllut:new-render:stepper-open';

const persistStepperOpenStateForLanguageChange = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStepperOpen = document.querySelector('.aksel-form-progress__button[data-state="open"]') !== null;
  window.sessionStorage.setItem(STEPPER_OPEN_STATE_STORAGE_KEY, String(isStepperOpen));
  return isStepperOpen;
};

const consumeStepperOpenState = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStepperOpen = window.sessionStorage.getItem(STEPPER_OPEN_STATE_STORAGE_KEY) === 'true';
  window.sessionStorage.removeItem(STEPPER_OPEN_STATE_STORAGE_KEY);
  return isStepperOpen;
};

export { consumeStepperOpenState, persistStepperOpenStateForLanguageChange };
