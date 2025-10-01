import { FeatureTogglesMap, Form, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { useBeforeUnload, useNavigate, useParams } from 'react-router';
import formPageReducer, { FormReducerState } from '../../Forms/formPageReducer';
import useForms from '../../api/useForms';

interface Props {
  featureToggles: FeatureTogglesMap;
  children: ReactNode;
}

interface ContextValue {
  formState: FormReducerState;
  resetForm: () => void;
  changeForm: (form: Form) => void;
  saveForm: (form: Form) => Promise<Form | void>;
  lockForm: (reason: string) => Promise<void>;
  unlockForm: () => Promise<void>;
  publishForm: (form: Form, selectedLanguages: TranslationLang[]) => Promise<void>;
  unpublishForm: () => Promise<void>;
  deleteForm: (form: Form) => Promise<void>;
  copyFormFromProduction: () => Promise<void>;
}

const initialState: FormReducerState = { status: 'INITIAL LOADING' };

const FormContext = createContext<ContextValue>({
  formState: initialState,
  resetForm: () => {},
  changeForm: (_form) => {},
  saveForm: async (_form) => {},
  lockForm: async (_reason: string) => Promise.reject(),
  unlockForm: async () => Promise.reject(),
  publishForm: async (_form, _translations) => {},
  unpublishForm: async () => {},
  deleteForm: async (_form: Form) => Promise.reject(),
  copyFormFromProduction: async () => {},
});

/**
 * @deprecated
 */
const FormProvider = ({ featureToggles, children }: Props) => {
  const { formPath } = useParams();
  const navigate = useNavigate();
  const { loadForm, onSave, onLockForm, onUnlockForm, onPublish, onUnpublish, onDelete, onCopyFromProd, getPublished } =
    useForms();
  const [state, dispatch] = useReducer(formPageReducer, initialState, (state) => state);

  useEffect(() => {
    if (formPath && state.status === 'INITIAL LOADING') {
      loadForm(formPath)
        .then((form) => {
          if (featureToggles.enableDiff && ['published', 'pending'].includes(form?.status ?? '')) {
            getPublished(formPath)
              .then((publishedForm) => dispatch({ type: 'form-loaded', form, publishedForm }))
              .catch(() => {
                console.debug('Failed to load published form');
                dispatch({ type: 'form-loaded', form });
              });
          } else {
            dispatch({ type: 'form-loaded', form });
          }
        })
        .catch((e) => {
          if (e.message === 'Not Found') {
            dispatch({ type: 'form-not-found' });
          } else {
            dispatch({ type: 'form-error' });
          }
        });
    }
  }, [loadForm, formPath, featureToggles.enableDiff, state.status, getPublished]);

  // Clear session storage on refresh
  useBeforeUnload(
    useCallback(() => {
      if (formPath) {
        sessionStorage.removeItem(formPath);
      }
    }, [formPath]),
  );

  useEffect(() => {
    if (state.status === 'FORM DELETED') {
      navigate('/forms');
    }
  }, [state.status, navigate]);

  const changeForm = useCallback((changedForm: Form) => {
    sessionStorage.setItem(changedForm.path, JSON.stringify({ changed: true }));
    dispatch({ type: 'form-changed', form: changedForm });
  }, []);

  const resetForm = () => {
    if (formPath) {
      sessionStorage.removeItem(formPath);
    }
    dispatch({ type: 'form-reset' });
  };

  const saveForm = async (form: Form) => {
    const savedForm = await onSave(form);
    if (formPath) {
      sessionStorage.removeItem(formPath);
    }
    if (savedForm) {
      dispatch({ type: 'form-saved', form: savedForm });
      return savedForm;
    }
    return form;
  };

  const lockForm = async (reason: string) => {
    if (formPath) {
      const result = await onLockForm(formPath, reason);
      if (result) {
        dispatch({ type: 'form-saved', form: result });
      }
    }
  };

  const unlockForm = async () => {
    if (formPath) {
      const result = await onUnlockForm(formPath);
      if (result) {
        dispatch({ type: 'form-saved', form: result });
      }
    }
  };

  const publishForm = async (form: Form, selectedLanguages: TranslationLang[]) => {
    const publishedForm = await onPublish(form, selectedLanguages);
    if (publishedForm) {
      dispatch({ type: 'form-saved', form: publishedForm, publishedForm });
    }
  };

  const unpublishForm = async () => {
    if (formPath) {
      const unpublishedForm = await onUnpublish(formPath);
      if (unpublishedForm) {
        dispatch({ type: 'form-saved', form: unpublishedForm });
      }
    }
  };

  const deleteForm = async (form: Form) => {
    const deleteResult = await onDelete(form);
    if (deleteResult.success) {
      dispatch({ type: 'form-deleted' });
    }
  };

  const copyFormFromProduction = async () => {
    if (formPath) {
      const savedForm = await onCopyFromProd(formPath);
      if (savedForm) {
        dispatch({ type: 'form-saved', form: savedForm });
      }
    }
  };

  const value = {
    formState: state,
    resetForm,
    changeForm,
    saveForm,
    lockForm,
    unlockForm,
    publishForm,
    unpublishForm,
    deleteForm,
    copyFormFromProduction,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = () => useContext(FormContext);
export default FormProvider;
