import {
  FeatureTogglesMap,
  FormPropertiesType,
  I18nTranslations,
  NavFormType,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer } from 'react';
import { useBeforeUnload, useParams } from 'react-router-dom';
import { loadPublishedForm } from '../../Forms/diffing/publishedForm';
import formPageReducer, { FormReducerState } from '../../Forms/formPageReducer';
import { useFormioForms } from '../../api/useFormioForms';

interface Props {
  featureToggles: FeatureTogglesMap;
  children: ReactNode;
}

interface ContextValue {
  formState: FormReducerState;
  changeForm: (form: NavFormType) => void;
  saveForm: (form: NavFormType) => Promise<void>;
  publishForm: (form: NavFormType, translations: I18nTranslations) => Promise<void>;
  unpublishForm: () => Promise<void>;
  copyFormFromProduction: () => Promise<void>;
  changeFormSettings: (properties: Partial<FormPropertiesType>) => Promise<void>;
}

const initialState: FormReducerState = { status: 'LOADING' };

const FormContext = createContext<ContextValue>({
  formState: initialState,
  changeForm: (_form) => {},
  saveForm: async (_form) => {},
  publishForm: async (_form, _translations) => {},
  unpublishForm: async () => {},
  copyFormFromProduction: async () => {},
  changeFormSettings: async (_properties) => {},
});

const FormProvider = ({ featureToggles, children }: Props) => {
  const { formPath } = useParams();
  const { loadForm, onSave, onPublish, onUnpublish, onCopyFromProd, onUpdateFormSettings } = useFormioForms();
  const [state, dispatch] = useReducer(formPageReducer, initialState, (state) => state);

  useEffect(() => {
    loadForm(formPath)
      .then((form) => {
        if (featureToggles.enableDiff) {
          loadPublishedForm(formPath)
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
  }, [loadForm, formPath, featureToggles.enableDiff]);

  // Clear session storage on refresh
  useBeforeUnload(
    useCallback(() => {
      if (formPath) {
        sessionStorage.removeItem(formPath);
      }
    }, [formPath]),
  );

  const changeForm = useCallback((changedForm: NavFormType) => {
    sessionStorage.setItem(changedForm.path, JSON.stringify({ changed: true }));
    dispatch({ type: 'form-changed', form: changedForm });
  }, []);

  const saveForm = async (form: NavFormType) => {
    const savedForm = await onSave(form);

    if (formPath) {
      sessionStorage.removeItem(formPath);
    }

    if (!savedForm.error) {
      dispatch({ type: 'form-saved', form: savedForm });
      return savedForm;
    }
    return form;
  };

  const publishForm = async (form: NavFormType, translations: I18nTranslations) => {
    const savedForm = await onPublish(form, translations);
    await loadPublishedForm(formPath)
      .then((publishedForm) => dispatch({ type: 'form-saved', form: savedForm, publishedForm }))
      .catch(() => {
        console.debug('Publish completed: Failed to load published form');
        dispatch({ type: 'form-saved', form: savedForm });
      });
  };

  const unpublishForm = async () => {
    const savedForm = await onUnpublish(state.form);
    await loadPublishedForm(formPath)
      .then((publishedForm) => dispatch({ type: 'form-saved', form: savedForm, publishedForm }))
      .catch(() => {
        console.debug('Unpublish completed: Failed to load published form');
        dispatch({ type: 'form-saved', form: savedForm });
      });
  };

  const copyFormFromProduction = async () => {
    const savedForm = await onCopyFromProd(formPath);
    if (!savedForm.error) {
      dispatch({ type: 'form-saved', form: savedForm });
    }
  };

  const changeFormSettings = async (properties: Partial<FormPropertiesType>) => {
    const toggledLockedForm = await onUpdateFormSettings(formPath, properties);
    dispatch({ type: 'form-changed', form: toggledLockedForm });
  };

  const value = {
    formState: state,
    changeForm,
    saveForm,
    publishForm,
    unpublishForm,
    copyFormFromProduction,
    changeFormSettings,
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

export const useForm = () => useContext(FormContext);
export default FormProvider;
