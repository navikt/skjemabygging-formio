import { useCallback, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/auth-context';
import { useForm } from '../context/form/FormContext';
import I18nStateProvider from '../context/i18n/I18nContext';
import EditFormPage from './edit/EditFormPage';
import FormError from './error/FormError';
import { FormSettingsPage } from './settings/FormSettingsPage';
import FormSkeleton from './skeleton/FormSkeleton';
import { TestFormPage } from './TestFormPage';

export const FormPage = ({ loadTranslations }) => {
  const { formState } = useForm();
  const { session } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const sessionData = await session();
        console.log(sessionData);
      } catch (_e) {
        // Just ignore if we cant get sessions, since this is just use to give the user timeout feedback
      }
    })();
  }, [session]);

  const loadTranslationsForFormPath = useCallback(
    () => loadTranslations(formState.form?.path),
    [loadTranslations, formState.form?.path],
  );

  if (formState.status === 'LOADING') {
    return <FormSkeleton leftSidebar={true} rightSidebar={true} />;
  }

  if (formState.status === 'ERROR') {
    return <FormError type="FORM_ERROR" />;
  }

  if (formState.status === 'FORM NOT FOUND' || !formState.form) {
    return <FormError type="FORM_NOT_FOUND" />;
  }

  return (
    <I18nStateProvider loadTranslations={loadTranslationsForFormPath} form={formState.form}>
      <Routes>
        <Route path={'/edit'} element={<EditFormPage form={formState.form} />} />
        <Route path={'/view/*'} element={<TestFormPage form={formState.form} />} />
        <Route path={'/settings'} element={<FormSettingsPage form={formState.form} />} />
        <Route path="/" element={<Navigate to={'edit'} replace />} />
      </Routes>
    </I18nStateProvider>
  );
};
