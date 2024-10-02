import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Route, Routes } from 'react-router-dom';
import FormProvider from '../context/form/FormContext';
import { useFormioForms } from '../hooks/useFormioForms';
import { useFormioTranslations } from '../hooks/useFormioTranslations';
import { FormPage } from './FormPage';
import NewFormPage from './NewFormPage';
import FormsListPage from './list/FormsListPage';

export const FormsRouter = ({ formio, serverURL }) => {
  const { featureToggles } = useAppConfig();
  const { loadFormsList } = useFormioForms();
  const { loadTranslationsForEditPage } = useFormioTranslations(serverURL, formio);

  return (
    <Routes>
      <Route path="/" element={<FormsListPage loadFormsList={loadFormsList} />} />
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
