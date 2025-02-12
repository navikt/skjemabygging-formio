import { FeatureTogglesMap, Form, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { useBeforeUnload, useParams } from 'react-router-dom';
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
  publishForm: (form: Form, selectedLanguages: TranslationLang[]) => Promise<void>;
  unpublishForm: () => Promise<void>;
  copyFormFromProduction: () => Promise<void>;
}

const initialState: FormReducerState = { status: 'INITIAL LOADING' };

const FormContext = createContext<ContextValue>({
  formState: initialState,
  resetForm: () => {},
  changeForm: (_form) => {},
  saveForm: async (_form) => {},
  publishForm: async (_form, _translations) => {},
  unpublishForm: async () => {},
  copyFormFromProduction: async () => {},
});

/**
 * @deprecated
 */
const FormProvider = ({ featureToggles, children }: Props) => {
  const { formPath } = useParams();
  const { loadForm, onSave, onPublish, onUnpublish, onCopyFromProd } = useForms();
  const [state, dispatch] = useReducer(formPageReducer, initialState, (state) => state);

  useEffect(() => {
    if (formPath && state.status === 'INITIAL LOADING') {
      loadForm(formPath)
        .then((form) => {
          // if (featureToggles.enableDiff) {
          //   loadPublishedForm(formPath)
          //     .then((publishedForm) => dispatch({ type: 'form-loaded', form, publishedForm }))
          //     .catch(() => {
          //       console.debug('Failed to load published form');
          //       dispatch({ type: 'form-loaded', form });
          //     });
          // } else {
          //   dispatch({ type: 'form-loaded', form });
          // }
          dispatch({ type: 'form-loaded', form });
        })
        .catch((e) => {
          if (e.message === 'Not Found') {
            dispatch({ type: 'form-not-found' });
          } else {
            dispatch({ type: 'form-error' });
          }
        });
    }
  }, [loadForm, formPath, featureToggles.enableDiff, state.status]);

  // Clear session storage on refresh
  useBeforeUnload(
    useCallback(() => {
      if (formPath) {
        sessionStorage.removeItem(formPath);
      }
    }, [formPath]),
  );

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

  const publishForm = async (form: Form, selectedLanguages: TranslationLang[]) => {
    await onPublish(form, selectedLanguages);
    // const savedForm = await onPublish(form, translations);
    // await loadPublishedForm(formPath)
    //   .then((publishedForm) => dispatch({ type: 'form-saved', form: savedForm, publishedForm }))
    //   .catch(() => {
    //     console.debug('Publish completed: Failed to load published form');
    //     dispatch({ type: 'form-saved', form: savedForm });
    //   });
  };

  /**
   * @deprecated
   */
  const unpublishForm = async () => {
    await onUnpublish(state.form);
    // const savedForm = await onUnpublish(state.form);
    // await loadPublishedForm(formPath)
    //   .then((publishedForm) => dispatch({ type: 'form-saved', form: savedForm, publishedForm }))
    //   .catch(() => {
    //     console.debug('Unpublish completed: Failed to load published form');
    //     dispatch({ type: 'form-saved', form: savedForm });
    //   });
  };

  /**
   * @deprecated
   */
  const copyFormFromProduction = async () => {
    await onCopyFromProd(formPath);
    // const savedForm = await onCopyFromProd(formPath);
    // if (!savedForm.error) {
    //   dispatch({ type: 'form-saved', form: savedForm });
    // }
  };

  const value = {
    formState: state,
    resetForm,
    changeForm,
    saveForm,
    publishForm,
    unpublishForm,
    copyFormFromProduction,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = () => useContext(FormContext);
export default FormProvider;
