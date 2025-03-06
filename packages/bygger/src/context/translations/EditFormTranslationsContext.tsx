import { htmlUtils } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiFormTranslation, stringUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import { editFormTranslationsReducer } from './editTranslationsReducer';
import { getTranslationsForSaving } from './editTranslationsReducer/selectors';
import { useFormTranslations } from './FormTranslationsContext';
import { getConflictAlertMessage, getGeneralAlertMessage, TranslationError } from './utils/errorUtils';
import { validateFormTranslations } from './utils/inputValidation';
import { saveEachTranslation } from './utils/utils';

interface Props {
  initialChanges?: FormsApiFormTranslation[];
  children: ReactNode;
}

type EditFormTranslationsContextValue = {
  updateTranslation: (original: FormsApiFormTranslation, lang: TranslationLang, value: string) => void;
  errors: TranslationError[];
  editState: string;
  saveChanges: () => Promise<void>;
};

const defaultValue: EditFormTranslationsContextValue = {
  updateTranslation: () => {},
  errors: [],
  editState: 'INIT',
  saveChanges: () => Promise.resolve(),
};

const EditFormTranslationsContext = createContext<EditFormTranslationsContextValue>(defaultValue);

const EditFormTranslationsProvider = ({ initialChanges, children }: Props) => {
  const [state, dispatch] = useReducer(editFormTranslationsReducer, {
    errors: [],
    status: 'INIT',
    changes: {},
  });
  const { storedTranslations, saveTranslation, loadTranslations } = useFormTranslations();
  const feedbackEmit = useFeedbackEmit();

  useEffect(() => {
    if (initialChanges && state.status === 'INIT') {
      dispatch({ type: 'INITIALIZE', payload: { initialChanges } });
    }
  }, [initialChanges, state.status]);

  const updateTranslation = (original: FormsApiFormTranslation, lang: TranslationLang, value: string) => {
    const { key } = original;
    const storedValue = storedTranslations[key]?.[lang];
    const currentChange = state.changes[key]?.[lang];
    const currentValue = currentChange ?? storedValue;
    if ((currentValue ?? '') === value) {
      return;
    }

    const originalValue = original[lang];

    if (originalValue !== value) {
      const { globalTranslationId, ...originalWithoutGlobal } = original;
      dispatch({ type: 'UPDATE', payload: { original: originalWithoutGlobal, lang, value } });
    }
  };

  const saveChanges = async () => {
    const translations = getTranslationsForSaving<FormsApiFormTranslation>(state);
    const validationErrors = validateFormTranslations(translations);

    if (validationErrors.length > 0) {
      dispatch({ type: 'VALIDATION_ERROR', payload: { errors: validationErrors } });
      validationErrors.forEach((error) => {
        const key = htmlUtils.isHtmlString(error.key) ? htmlUtils.extractTextContent(error.key) : error.key;
        feedbackEmit.error(`${stringUtils.truncate(key, 50)}: ${error.message}`);
      });
    } else {
      dispatch({ type: 'SAVE_STARTED' });
      const { responses, errors } = await saveEachTranslation(translations, saveTranslation);

      await loadTranslations();
      dispatch({ type: 'SAVE_FINISHED', payload: { errors } });
      if (responses.length > 0) {
        feedbackEmit.success(`${responses.length} oversettelser ble lagret.`);
      }

      const conflictAlertMessage = getConflictAlertMessage(errors);
      const generalAlertMessage = getGeneralAlertMessage(errors);
      if (conflictAlertMessage) {
        feedbackEmit.error(conflictAlertMessage);
      }
      if (generalAlertMessage) {
        feedbackEmit.error(generalAlertMessage);
      }
    }
  };

  const value = {
    storedTranslations,
    updateTranslation,
    errors: state.errors,
    editState: state.status,
    saveChanges,
  };

  return <EditFormTranslationsContext.Provider value={value}>{children}</EditFormTranslationsContext.Provider>;
};

const useEditFormTranslations = () => useContext(EditFormTranslationsContext);

export { useEditFormTranslations };
export default EditFormTranslationsProvider;
