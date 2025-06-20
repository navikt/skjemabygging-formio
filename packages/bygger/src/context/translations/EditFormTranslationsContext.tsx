import { htmlUtils } from '@navikt/skjemadigitalisering-shared-components';
import { FormsApiTranslation, stringUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import { editFormTranslationsReducer } from './editTranslationsReducer';
import { getTranslationsForSaving } from './editTranslationsReducer/selectors';
import { useFormTranslations } from './FormTranslationsContext';
import { getConflictAlertMessage, getGeneralAlertMessage, TranslationError } from './utils/errorUtils';
import { validateFormTranslations } from './utils/inputValidation';
import { saveEachTranslation } from './utils/utils';

interface Props {
  initialChanges?: FormsApiTranslation[];
  children: ReactNode;
}

type EditFormTranslationsContextValue = {
  updateTranslation: (original: FormsApiTranslation, lang: TranslationLang, value: string) => void;
  addKeyBasedText: (value: string) => string;
  updateKeyBasedText: (value: string, key: string) => string;
  errors: TranslationError[];
  editState: string;
  saveChanges: () => Promise<void>;
};

const defaultValue: EditFormTranslationsContextValue = {
  updateTranslation: () => {},
  errors: [],
  editState: 'INIT',
  saveChanges: () => Promise.resolve(),
  addKeyBasedText: () => '',
  updateKeyBasedText: () => '',
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

  const updateTranslation = (original: FormsApiTranslation, lang: TranslationLang, value: string) => {
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

  const addKeyBasedText = (value: string) => {
    const translationKey = uuidv4();
    dispatch({ type: 'ADD', payload: { key: translationKey, nb: value, tag: 'introPage' } });
    return translationKey;
  };

  const updateKeyBasedText = (value: string, key: string) => {
    const original = state.changes[key] ?? storedTranslations[key];
    updateTranslation(original, 'nb', value);
    return key;
  };

  const saveChanges = async () => {
    const translations = getTranslationsForSaving(state);
    const validationErrors = validateFormTranslations(translations);

    if (translations.length === 0) {
      feedbackEmit.success('Ingen endringer oppdaget. Oversettelser ble ikke lagret.');
      return;
    }

    if (validationErrors.length > 0) {
      dispatch({ type: 'VALIDATION_ERROR', payload: { errors: validationErrors } });
      validationErrors.forEach((error) => {
        const key = htmlUtils.isHtmlString(error.key) ? htmlUtils.extractTextContent(error.key) : error.key;
        feedbackEmit.error(`${stringUtils.truncate(key, 50)}: ${error.message}`);
      });
      return;
    }

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

    if (errors.length > 0) {
      throw new Error(
        `Feil under lagring av oversettelser: "${conflictAlertMessage ?? `${conflictAlertMessage}, `}${generalAlertMessage ?? ''}"`,
      );
    }
  };

  const value = {
    storedTranslations,
    updateTranslation,
    errors: state.errors,
    editState: state.status,
    saveChanges,
    addKeyBasedText,
    updateKeyBasedText,
  };

  return <EditFormTranslationsContext.Provider value={value}>{children}</EditFormTranslationsContext.Provider>;
};

const useEditFormTranslations = () => useContext(EditFormTranslationsContext);

export { useEditFormTranslations };
export default EditFormTranslationsProvider;
