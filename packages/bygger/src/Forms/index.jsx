import { Route, Routes } from 'react-router-dom';
import { useFormioForms } from '../hooks/useFormioForms';
import { useFormioTranslations } from '../hooks/useFormioTranslations';
import { FormPage } from './FormPage';
import { FormsListPage } from './FormsListPage';
import NewFormPage from './NewFormPage';

export const FormsRouter = ({ formio, serverURL }) => {
  const { loadForm, loadFormsList, onSave, onPublish, onUnpublish } = useFormioForms();
  const { loadTranslationsForEditPage } = useFormioTranslations(serverURL, formio);

  return (
    <Routes>
      <Route path="/" element={<FormsListPage loadFormsList={loadFormsList} />} />
      <Route path={'/new'} element={<NewFormPage formio={formio} />} />
      <Route
        path={'/:formPath/*'}
        element={
          <FormPage
            loadForm={loadForm}
            loadTranslations={loadTranslationsForEditPage}
            onSave={onSave}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
          />
        }
      />
    </Routes>
  );
};
