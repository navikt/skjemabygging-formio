import { Route, Routes, useRouteMatch } from "react-router-dom";
import { useFormioForms } from "../hooks/useFormioForms";
import { useFormioTranslations } from "../hooks/useFormioTranslations";
import { FormPage } from "./FormPage";
import { FormsListPage } from "./FormsListPage";
import NewFormPage from "./NewFormPage";

export const FormsRouter = ({ formio, serverURL }) => {
  let { path, url } = useRouteMatch();
  const { loadForm, loadFormsList, onSave, onPublish, onUnpublish } = useFormioForms(formio);
  const { loadTranslationsForEditPage } = useFormioTranslations(serverURL, formio);

  return (
    <Routes>
      <Route path={`${path}/new`} element={<NewFormPage formio={formio} />} />
      <Route
        path={`${path}/:formPath`}
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
      <Route path={path} element={<FormsListPage loadFormsList={loadFormsList} url={url} />} />
    </Routes>
  );
};
