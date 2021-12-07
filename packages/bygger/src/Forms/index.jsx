import { CustomComponents, LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import Components from "formiojs/components/Components";
import "nav-frontend-lenker-style";
import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import I18nProvider from "../context/i18n";
import { FormPage } from "./FormPage";
import { FormsListPage } from "./FormsListPage";
import NewFormPage from "./NewFormPage";

export const FormsRouter = ({ forms, onChange, onSave, onCreate, onDelete, onPublish, loadTranslations }) => {
  Components.setComponents(CustomComponents);
  let { path, url } = useRouteMatch();
  if (!forms) {
    return <LoadingComponent />;
  }
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage onCreate={onCreate} />
      </Route>
      <Route
        path={`${path}/:formPath`}
        render={({ match }) => {
          const form = getFormFromPath(forms, match.params.formPath);
          return (
            <I18nProvider loadTranslations={() => loadTranslations(form.path)} form={form}>
              <FormPage {...match.params} form={form} onChange={onChange} onSave={onSave} onPublish={onPublish} />
            </I18nProvider>
          );
        }}
      />
      <Route path={path}>
        <FormsListPage forms={forms} url={url} onDelete={onDelete} />
      </Route>
    </Switch>
  );
};

const getFormFromPath = (forms, path) => {
  const result = forms.find(navFormUtils.formMatcherPredicate(path));
  if (!result) {
    throw Error(`No form at path "${path}"`);
  }
  return result;
};
