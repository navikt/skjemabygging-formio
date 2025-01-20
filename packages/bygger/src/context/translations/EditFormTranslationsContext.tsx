import { FormsApiFormTranslation, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { useFeedbackEmit } from '../notifications/FeedbackContext';
import { editFormTranslationsReducer } from './editTranslationsReducer';
import { getTranslationsForSaving } from './editTranslationsReducer/selectors';
import { useFormTranslations } from './FormTranslationsContext';
import { EditTranslationsContextValue } from './types';
import { getConflictAlertMessage, getGeneralAlertMessage } from './utils/errorUtils';
import { saveEachTranslation } from './utils/utils';

interface Props {
  initialChanges?: FormsApiFormTranslation[];
  children: ReactNode;
}

const defaultValue: EditTranslationsContextValue<FormsApiFormTranslation> = {
  updateTranslation: () => {},
  errors: [],
  editState: 'INIT',
  saveChanges: () => Promise.resolve(),
};

const EditFormTranslationsContext = createContext<EditTranslationsContextValue<FormsApiFormTranslation>>(defaultValue);

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
    dispatch({ type: 'SAVE_STARTED' });
    const { responses, errors } = await saveEachTranslation(
      getTranslationsForSaving<FormsApiFormTranslation>(state),
      saveTranslation,
    );

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

export { EditFormTranslationsContext, useEditFormTranslations };
export default EditFormTranslationsProvider;
