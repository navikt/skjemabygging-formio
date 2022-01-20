import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import MigrationFormPreview from "./MigrationFormPreview";
import MigrationPage from "./MigrationPage";

const MigrationRouter = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/forhandsvis/:formPath`}>
        <MigrationFormPreview />
      </Route>
      <Route exact path={path}>
        <MigrationPage />
      </Route>
    </Switch>
  );
};

export default MigrationRouter;
