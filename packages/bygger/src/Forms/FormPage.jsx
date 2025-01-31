import { Navigate, Route, Routes } from 'react-router-dom';
import { useForm } from '../context/old_form/FormContext';
import FormTranslationsProvider from '../context/translations/FormTranslationsContext';
import GlobalTranslationsProvider from '../context/translations/GlobalTranslationsContext';
import FormTranslationsPage from '../translations/form/FormTranslationsPage';
import EditFormPage from './edit/EditFormPage';
import FormError from './error/FormError';
import { FormSettingsPage } from './settings/FormSettingsPage';
import FormSkeleton from './skeleton/FormSkeleton';
import { TestFormPage } from './TestFormPage';

export const FormPage = () => {
  const { formState } = useForm();

  if (formState.status === 'INITIAL LOADING') {
    return <FormSkeleton leftSidebar={true} rightSidebar={true} />;
  }

  if (formState.status === 'ERROR') {
    return <FormError type="FORM_ERROR" />;
  }

  if (formState.status === 'FORM NOT FOUND' || !formState.form) {
    return <FormError type="FORM_NOT_FOUND" />;
  }

  return (
    // <I18nStateProvider loadTranslations={loadTranslationsForFormPath} form={formState.form}>
    <FormTranslationsProvider formPath={formState.form.path}>
      <GlobalTranslationsProvider>
        <Routes>
          <Route path={'/edit'} element={<EditFormPage form={formState.form} />} />
          <Route path={'/view/*'} element={<TestFormPage form={formState.form} />} />
          <Route path={'/settings'} element={<FormSettingsPage form={formState.form} />} />
          <Route path={'/oversettelser'} element={<FormTranslationsPage form={formState.form} />} />
          <Route path="/" element={<Navigate to={'edit'} replace />} />
        </Routes>
      </GlobalTranslationsProvider>
    </FormTranslationsProvider>
    // </I18nStateProvider>
  );
};
