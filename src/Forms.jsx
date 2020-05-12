import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import FormEdit from "./react-formio/FormEdit";
import React from "react";

export const Forms = ({ forms, projectURL }) => {
  let { path, url } = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${path}/:formpath`}
        render={({match}) => {
          let { params } = match;
          if (forms) {
            const form = getFormFromPath(forms, params.formpath);
            return (
              form && (
                <FormEdit
                  key={form._id}
                  form={form}
                  options={{
                    src: `${projectURL}/${params.formpath}`
                  }}
                  saveForm={() => console.log(form)}
                  saveText="LAGRE"
                />
              )
            );
          }
          return <h1>Laster...</h1>;
        }}
      />
      <Route path={path}>
        {forms && (
          <nav>
            <h3>Velg skjema:</h3>
            <ul>
              {forms.map(form => (
                <li key={form.path}>
                  <Link to={`${url}/${form.path}`}>{form.title}</Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </Route>
    </Switch>
  );
};

const getFormFromPath = (forms, path) => forms.find(form => form.path === path);
