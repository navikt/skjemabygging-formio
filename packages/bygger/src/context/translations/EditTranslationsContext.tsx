import { FormsApiGlobalTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useReducer } from 'react';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import { useGlobalTranslations } from './GlobalTranslationsContext';
import reducer, { TranslationError } from './editTranslationsReducer/reducer';
import { getTranslationsForSaving, hasNewTranslationData } from './editTranslationsReducer/selectors';

//TODO: move me
export type TranslationLang = 'nb' | 'nn' | 'en';

interface EditTranslationsContextValue {
  updateTranslation: (original: FormsApiGlobalTranslation, property: TranslationLang, value: string) => void;
  errors: TranslationError[];
  newTranslation: FormsApiGlobalTranslation;
  updateNewTranslation: (property: TranslationLang, value: string) => void;
  saveChanges: () => Promise<void>;
}

const defaultNewSkjemateksterTranslation: FormsApiGlobalTranslation = {
  key: '',
  tag: 'skjematekster',
  nb: '',
  nn: '',
  en: '',
};
const defaultValue = {
  updateTranslation: () => {},
  errors: [],
  newTranslation: defaultNewSkjemateksterTranslation,
  updateNewTranslation: () => {},
  saveChanges: () => Promise.resolve(),
};

const EditTranslationsContext = createContext<EditTranslationsContextValue>(defaultValue);

const EditTranslationsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    errors: [],
    state: 'INIT',
    new: defaultNewSkjemateksterTranslation,
    changes: {},
  });
  const { storedTranslations, saveTranslations } = useGlobalTranslations();
  const feedbackEmit = useFeedbackEmit();

  const updateTranslation = (
    originalTranslation: FormsApiGlobalTranslation,
    property: TranslationLang,
    value: string,
  ) => {
    const { key } = originalTranslation;
    const storedValue = storedTranslations[key]?.[property];
    const currentChange = state.changes[key]?.[property];
    const currentValue = currentChange ?? storedValue;
    if ((currentValue ?? '') === value) {
      return;
    }
    dispatch({ type: 'UPDATE', payload: { original: originalTranslation, property, value } });
  };

  const updateNewTranslation = (property: TranslationLang, value: string) => {
    const currentValue = state.new[property];
    if ((currentValue ?? '') === value) {
      return;
    }
    dispatch({ type: 'UPDATE_NEW', payload: { property, value } });
  };

  const validate = (
    translation: FormsApiGlobalTranslation,
    isNewTranslation: boolean = false,
  ): TranslationError | undefined => {
    if (!translation.key) {
      return { key: translation.key, type: 'MISSING_KEY_VALIDATION', isNewTranslation };
    }
  };

  const saveChanges = async () => {
    const newTranslationHasData = hasNewTranslationData(state);
    const validationError = newTranslationHasData ? validate(state.new, true) : undefined;
    if (validationError) {
      dispatch({ type: 'VALIDATION_ERROR', payload: { errors: [validationError] } });
    } else {
      dispatch({ type: 'CLEAR_ERRORS' });
      const updates = getTranslationsForSaving(state);
      const result = await saveTranslations(Object.values(updates ?? {}));
      dispatch({ type: 'SAVED', payload: { defaultNew: defaultNewSkjemateksterTranslation, errors: result } });

      //TODO: move
      const conflictErrors = result.filter((error) => error.type === 'CONFLICT');
      if (conflictErrors.length > 0) {
        const message =
          conflictErrors.length === 1
            ? `1 oversettelse ble ikke lagret fordi en nyere versjon allerede eksisterer`
            : `${conflictErrors.length} oversettelser ble ikke lagret fordi en nyere versjon allerede eksisterer`;
        feedbackEmit.error(message);
      }
      //TODO: move + bedre feilmelding
      const otherErrors = result.filter((error) => error.type === 'OTHER_HTTP');
      if (otherErrors.length > 0) {
        const message =
          otherErrors.length === 1
            ? `1 oversettelse ble ikke lagret på grunn av en teknisk feil`
            : `${otherErrors.length} oversettelser ble ikke lagret på grunn av en teknisk feil`;
        feedbackEmit.error(message);
      }
    }
  };

  const value = {
    updateTranslation,
    errors: state.errors,
    newTranslation: state.new,
    updateNewTranslation,
    saveChanges,
  };

  return <EditTranslationsContext.Provider value={value}>{children}</EditTranslationsContext.Provider>;
};

export const useEditTranslations = () => useContext(EditTranslationsContext);
export default EditTranslationsProvider;
