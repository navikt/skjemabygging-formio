import {
  FormsApiGlobalTranslation,
  FormsApiTranslation,
  formsApiTranslations,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { Context, createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import ApiError from '../../api/ApiError';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import reducer, { Status } from './editTranslationsReducer/reducer';
import { getTranslationsForSaving, hasNewTranslationData } from './editTranslationsReducer/selectors';
import { TranslationsContextValue } from './types';
import {
  getConflictAlertMessage,
  getGeneralAlertMessage,
  getTranslationHttpError,
  TranslationError,
} from './utils/errorUtils';

interface Props<Translation extends FormsApiTranslation> {
  context: Context<TranslationsContextValue<Translation>>;
  initialChanges?: Translation[];
  children: ReactNode;
}

interface EditTranslationsContextValue {
  updateTranslation: (original: FormsApiTranslation, lang: TranslationLang, value: string) => void;
  errors: TranslationError[];
  newTranslation: FormsApiGlobalTranslation;
  editState: Status;
  updateNewTranslation: (lang: TranslationLang, value: string) => void;
  saveChanges: () => Promise<void>;
}

const defaultNewSkjemateksterTranslation: FormsApiGlobalTranslation = {
  key: '',
  tag: 'skjematekster',
  nb: '',
  nn: '',
  en: '',
};
const defaultValue: EditTranslationsContextValue = {
  updateTranslation: () => {},
  errors: [],
  newTranslation: defaultNewSkjemateksterTranslation,
  editState: 'INIT',
  updateNewTranslation: () => {},
  saveChanges: () => Promise.resolve(),
};

const EditTranslationsContext = createContext<EditTranslationsContextValue>(defaultValue);

const EditTranslationsProvider = <Translation extends FormsApiTranslation>({
  context,
  initialChanges,
  children,
}: Props<Translation>) => {
  const [state, dispatch] = useReducer(reducer<Translation>, {
    errors: [],
    state: 'INIT',
    new: defaultNewSkjemateksterTranslation,
    changes: {},
  });
  const { storedTranslations, loadTranslations, createNewTranslation, saveTranslation } = useContext(context);
  const feedbackEmit = useFeedbackEmit();

  useEffect(() => {
    if (initialChanges && state.state === 'INIT') {
      dispatch({ type: 'INITIALIZE', payload: { initialChanges } });
    }
  }, [initialChanges, state.state]);

  const updateTranslation = <Translation extends FormsApiTranslation>(
    original: Translation,
    lang: TranslationLang,
    value: string,
  ) => {
    const { key } = original;
    const storedValue = storedTranslations[key]?.[lang];
    const currentChange = state.changes[key]?.[lang];
    const currentValue = currentChange ?? storedValue;
    if ((currentValue ?? '') === value) {
      return;
    }

    const originalValue = original[lang];
    if (formsApiTranslations.isFormTranslation(original) && originalValue !== value) {
      delete original.globalTranslationId;
      const { globalTranslationId, ...originalWithoutGlobal } = original;
      dispatch({ type: 'UPDATE', payload: { original: originalWithoutGlobal, lang, value } });
    } else {
      dispatch({ type: 'UPDATE', payload: { original, lang, value } });
    }
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

  const saveExistingTranslations = async (): Promise<{
    responses: FormsApiTranslation[];
    errors: TranslationError[];
  }> => {
    const func = async (translation: Translation) => {
      try {
        return { response: await saveTranslation(translation) };
      } catch (error) {
        if (error instanceof ApiError) {
          return { error: getTranslationHttpError(error.httpStatus, translation) };
        } else {
          throw error;
        }
      }
    };

    const results = await Promise.all(getTranslationsForSaving(state).map(func));

    return {
      responses: results.flatMap((result) => (result.response ? result.response : [])),
      errors: results.flatMap((result) => (result.error ? result.error : [])),
    };
  };

  const saveChanges = async () => {
    const newTranslationHasData = hasNewTranslationData(state);
    const validationError = newTranslationHasData ? validate(state.new, true) : undefined;
    if (validationError) {
      dispatch({ type: 'VALIDATION_ERROR', payload: { errors: [validationError] } });
    } else {
      dispatch({ type: 'CLEAR_ERRORS' });
      const { responses, errors } = await saveExistingTranslations();

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
      dispatch({ type: 'SAVED', payload: { defaultNew: defaultNewSkjemateksterTranslation, errors } });
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

  return <EditTranslationsContext.Provider value={value}>{children}</EditTranslationsContext.Provider>;
};

export const useEditTranslations = () => useContext(EditTranslationsContext);
export default EditTranslationsProvider;
