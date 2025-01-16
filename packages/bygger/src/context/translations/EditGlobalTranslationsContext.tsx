import { FormsApiGlobalTranslation, stringUtils, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import { editGlobalTranslationsReducer } from './editTranslationsReducer';
import { createDefaultGlobalTranslation } from './editTranslationsReducer/reducerUtils';
import { getTranslationsForSaving, hasNewTranslationData } from './editTranslationsReducer/selectors';
import { useGlobalTranslations } from './GlobalTranslationsContext';
import { EditTranslationsContextValue } from './types';
import { getConflictAlertMessage, getGeneralAlertMessage, TranslationError } from './utils/errorUtils';
import { validate, validateTranslations } from './utils/inputValidation';
import { saveEachTranslation } from './utils/utils';

interface Props {
  initialChanges?: FormsApiGlobalTranslation[];
  children: ReactNode;
}

const defaultValue: EditTranslationsContextValue<FormsApiGlobalTranslation> = {
  updateTranslation: () => {},
  errors: [],
  newTranslation: createDefaultGlobalTranslation(),
  editState: 'INIT',
  updateNewTranslation: () => {},
  saveChanges: () => Promise.resolve(),
};

const EditGlobalTranslationsContext =
  createContext<EditTranslationsContextValue<FormsApiGlobalTranslation>>(defaultValue);

const EditGlobalTranslationsProvider = ({ initialChanges, children }: Props) => {
  const [state, dispatch] = useReducer(editGlobalTranslationsReducer, {
    errors: [],
    status: 'INIT',
    new: createDefaultGlobalTranslation(),
    changes: {},
  });
  const { storedTranslations, loadTranslations, createNewTranslation, saveTranslation } = useGlobalTranslations();
  const feedbackEmit = useFeedbackEmit();

  useEffect(() => {
    if (initialChanges && state.status === 'INIT') {
      dispatch({ type: 'INITIALIZE', payload: { initialChanges } });
    }
  }, [initialChanges, state.status]);

  const updateTranslation = (original: FormsApiGlobalTranslation, lang: TranslationLang, value: string) => {
    const { key } = original;
    const storedValue = storedTranslations[key]?.[lang];
    const currentChange = state.changes[key]?.[lang];
    const currentValue = currentChange ?? storedValue;
    if ((currentValue ?? '') === value) {
      return;
    }

    dispatch({ type: 'UPDATE', payload: { original, lang, value } });
  };

  const updateNewTranslation = (lang: TranslationLang, value: string) => {
    const currentValue = state.new[lang];
    if ((currentValue ?? '') === value) {
      return;
    }
    dispatch({ type: 'UPDATE_NEW', payload: { lang, value } });
  };

  const saveChanges = async () => {
    const newTranslationHasData = hasNewTranslationData(state);
    const newTranslationValidationError = newTranslationHasData && validate(state.new, true);
    const translations = getTranslationsForSaving<FormsApiGlobalTranslation>(state);
    const validationErrors: TranslationError[] = [
      ...(newTranslationValidationError ? [newTranslationValidationError] : []),
      ...validateTranslations(translations),
    ];
    if (validationErrors.length > 0) {
      console.log(validationErrors);
      dispatch({ type: 'VALIDATION_ERROR', payload: { errors: validationErrors } });
      validationErrors.forEach((error) =>
        feedbackEmit.error(
          `${error?.isNewTranslation ? 'Ny oversettelse' : stringUtils.truncate(error.key, 50)}: ${error.message}`,
        ),
      );
    } else {
      dispatch({ type: 'SAVE_STARTED' });
      const { responses, errors } = await saveEachTranslation(translations, saveTranslation);

      if (newTranslationHasData && createNewTranslation) {
        const newTranslationResult = await createNewTranslation(state.new);
        if (newTranslationResult?.error) {
          errors.push(newTranslationResult.error);
        }
        if (newTranslationResult?.response) {
          responses.push(newTranslationResult.response);
        }
      }

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
    updateTranslation,
    errors: state.errors,
    newTranslation: state.new,
    editState: state.status,
    updateNewTranslation,
    saveChanges,
  };

  return <EditGlobalTranslationsContext.Provider value={value}>{children}</EditGlobalTranslationsContext.Provider>;
};

const useEditGlobalTranslations = () => useContext(EditGlobalTranslationsContext);

export { EditGlobalTranslationsContext, useEditGlobalTranslations };
export default EditGlobalTranslationsProvider;
