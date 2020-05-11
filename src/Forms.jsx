import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import FormEdit from "./react-formio/FormEdit";
import React from "react";

export const Forms = ({ forms, projectURL }) => {
  let match = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${match.path}/:formpath`}
        render={props => {
          const { formpath } = props.match.params;
          if (forms) {
            const form = getFormFromPath(forms, formpath);
            return (
              form && (
                <FormEdit
                  key={form._id}
                  form={form}
                  options={{
                    src: `${projectURL}/${formpath}`
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
      <Route path={match.path}>
        {forms && (
          <nav>
            <h3>Velg skjema:</h3>
            <ul>
              {forms.map(form => (
                <li key={form.path}>
                  <Link to={`${match.path}/${form.path}`}>{form.title}</Link>
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
