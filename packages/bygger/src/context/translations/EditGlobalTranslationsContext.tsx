import {
  FormsApiGlobalTranslation,
  FormsApiTranslation,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import { editGlobalTranslationsReducer } from './editTranslationsReducer';
import { createDefaultGlobalTranslation } from './editTranslationsReducer/reducerUtils';
import { getTranslationsForSaving, hasNewTranslationData } from './editTranslationsReducer/selectors';
import { useGlobalTranslations } from './GlobalTranslationsContext';
import { EditTranslationsContextValue } from './types';
import { getConflictAlertMessage, getGeneralAlertMessage, TranslationError } from './utils/errorUtils';
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
    state: 'INIT',
    new: createDefaultGlobalTranslation(),
    changes: {},
  });
  const { storedTranslations, loadTranslations, createNewTranslation, saveTranslation } = useGlobalTranslations();
  const feedbackEmit = useFeedbackEmit();

  useEffect(() => {
    if (initialChanges && state.state === 'INIT') {
      dispatch({ type: 'INITIALIZE', payload: { initialChanges } });
    }
  }, [initialChanges, state.state]);

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

  const validate = (
    translation: FormsApiTranslation,
    isNewTranslation: boolean = false,
  ): TranslationError | undefined => {
    if (!translation.key) {
      return {
        key: translation.key,
        type: 'MISSING_KEY_VALIDATION',
        message: 'Legg til bokmålstekst for å opprette ny oversettelse',
        isNewTranslation,
      };
    }
  };

  const saveChanges = async () => {
    const newTranslationHasData = hasNewTranslationData(state);
    const validationError = newTranslationHasData ? validate(state.new, true) : undefined;
    if (validationError) {
      dispatch({ type: 'VALIDATION_ERROR', payload: { errors: [validationError] } });
    } else {
      dispatch({ type: 'CLEAR_ERRORS' });
      const { responses, errors } = await saveEachTranslation(
        getTranslationsForSaving<FormsApiGlobalTranslation>(state),
        saveTranslation,
      );

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
      dispatch({ type: 'SAVED', payload: { errors } });
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
    editState: state.state,
    updateNewTranslation,
    saveChanges,
  };

  return <EditGlobalTranslationsContext.Provider value={value}>{children}</EditGlobalTranslationsContext.Provider>;
};

const useEditGlobalTranslations = () => useContext(EditGlobalTranslationsContext);

export { EditGlobalTranslationsContext, useEditGlobalTranslations };
export default EditGlobalTranslationsProvider;
