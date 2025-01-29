import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Route, Routes } from 'react-router-dom';
import { useFormioTranslations } from '../api/useFormioTranslations';
import FormProvider from '../context/old_form/FormContext';
import { FormPage } from './FormPage';
import NewFormPage from './NewFormPage';
import FormsListPage from './list/FormsListPage';

export const FormsRouter = ({ formio, serverURL }) => {
  const { featureToggles } = useAppConfig();
  const { loadTranslationsForEditPage } = useFormioTranslations(serverURL, formio);

  return (
    <Routes>
      <Route path="/" element={<FormsListPage />} />
      <Route path={'/new'} element={<NewFormPage formio={formio} />} />
      <Route
        path={'/:formPath/*'}
        element={
          <FormProvider featureToggles={featureToggles}>
            <FormPage loadTranslations={loadTranslationsForEditPage} />
          </FormProvider>
        }
      />
    </Routes>
  );
};
