import { LoadingComponent, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { useCallback, useEffect, useReducer } from 'react';
import { Navigate, Route, Routes, useBeforeUnload, useParams } from 'react-router-dom';
import I18nStateProvider from '../context/i18n/I18nContext';
import { EditFormPage } from './EditFormPage';
import { FormSettingsPage } from './FormSettingsPage';
import { TestFormPage } from './TestFormPage';
import { loadPublishedForm } from './diffing/publishedForm';
import formPageReducer from './formPageReducer';

export const FormPage = ({ loadForm, loadTranslations, onSave, onPublish, onUnpublish, onCopyFromProd }) => {
  const { featureToggles, diffOn } = useAppConfig();
  const { formPath } = useParams();
  const [state, dispatch] = useReducer(formPageReducer, { status: 'LOADING' }, (state) => state);
  const loadTranslationsForFormPath = useCallback(
    () => loadTranslations(state.form?.path),
    [loadTranslations, state.form?.path],
  );

  // Clear session storage on refresh
  useBeforeUnload(
    useCallback(() => {
      sessionStorage.removeItem(formPath);
    }, [formPath]),
  );

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
        console.log(e);
        dispatch({ type: 'form-not-found' });
      });
  }, [loadForm, formPath, featureToggles.enableDiff]);

  const onChange = useCallback((changedForm) => {
    sessionStorage.setItem(changedForm.path, JSON.stringify({ changed: true }));
    dispatch({ type: 'form-changed', form: changedForm });
  }, []);

  const saveForm = async (form) => {
    const savedForm = await onSave(form);
    sessionStorage.removeItem(formPath);

    if (!savedForm.error) {
      dispatch({ type: 'form-saved', form: savedForm });
      return savedForm;
    }
    return form;
  };

  const publishForm = async (form, translations) => {
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
    const savedForm = await onCopyFromProd(state.form.path);
    if (!savedForm.error) {
      dispatch({ type: 'form-saved', form: savedForm });
    }
  };

  if (state.status === 'LOADING') {
    return <LoadingComponent />;
  }

  if (state.status === 'FORM NOT FOUND' || !state.form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }

  return (
    <I18nStateProvider loadTranslations={loadTranslationsForFormPath} form={state.form}>
      <Routes>
        <Route
          path={'/edit'}
          element={
            <EditFormPage
              form={state.form}
              publishedForm={diffOn ? state.publishedForm : undefined}
              onSave={saveForm}
              onChange={onChange}
              onPublish={publishForm}
              onUnpublish={unpublishForm}
            />
          }
        />
        <Route path={'/view/*'} element={<TestFormPage form={state.form} />} />
        <Route
          path={'/settings'}
          element={
            <FormSettingsPage
              form={state.form}
              publishedForm={diffOn ? state.publishedForm : undefined}
              onSave={saveForm}
              onChange={onChange}
              onPublish={publishForm}
              onUnpublish={unpublishForm}
              onCopyFromProd={copyFormFromProduction}
            />
          }
        />
        <Route path="/" element={<Navigate to={'edit'} replace />} />
      </Routes>
    </I18nStateProvider>
  );
};
