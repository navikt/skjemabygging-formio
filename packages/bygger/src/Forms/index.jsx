import { Route, Switch, useRouteMatch } from "react-router-dom";
import "nav-frontend-lenker-style";
import React from "react";
import { makeStyles } from "@material-ui/styles";
import NewFormPage from "./NewFormPage";
import { FormsListPage } from "./FormsListPage";
import { FormPage } from "./FormPage";
import { CustomComponents } from "@navikt/skjemadigitalisering-shared-components";
import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import Components from "formiojs/components/Components";
import I18nProvider from "../context/i18n";

const useLoadingStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    width: "100vw",
    "& h1": {
      fontSize: "3rem",
      fontWeight: "bolder",
    },
  },
});

const LoadingComponent = () => {
  const classes = useLoadingStyles();
  return (
    <div className={classes.root}>
      <h1>Laster...</h1>
    </div>
  );
};
export const FormsRouter = ({
  forms,
  onChange,
  onSave,
  onNew,
  onCreate,
  onDelete,
  onPublish,
  loadTranslations,
  onLogout,
}) => {
  Components.setComponents(CustomComponents);
  let { path, url } = useRouteMatch();
  if (!forms) {
    return <LoadingComponent />;
  }
  return (
    <Switch>
      <Route path={`${path}/new`}>
        <NewFormPage onCreate={onCreate} onLogout={onLogout} />
      </Route>
      <Route
        path={`${path}/:formpath`}
        render={({ match }) => {
          const form = getFormFromPath(forms, match.params.formpath);
          return (
            <I18nProvider loadTranslations={() => loadTranslations(form.path)} form={form}>
              <FormPage
                {...match.params}
                form={form}
                onChange={onChange}
                onSave={onSave}
                onPublish={onPublish}
                onLogout={onLogout}
              />
            </I18nProvider>
          );
        }}
      />
      <Route path={path}>
        <FormsListPage onLogout={onLogout} forms={forms} url={url} onDelete={onDelete} onNew={onNew} />
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
