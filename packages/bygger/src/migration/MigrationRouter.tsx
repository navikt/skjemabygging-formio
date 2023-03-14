import React from "react";
import { Route, Switch, useRouteMatch } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import MigrationFormPreview from "./MigrationFormPreview";
import MigrationPage from "./MigrationPage";

const MigrationRouter = () => {
  const { path } = useRouteMatch("/migrering");
  return (
    <AppLayout
      navBarProps={{
        title: "Migrer skjema",
        visSkjemaliste: true,
        visSkjemaMeny: false,
      }}
    >
      <Switch>
        <Route path={`${path}/forhandsvis/:formPath`}>
          <MigrationFormPreview />
        </Route>
        <Route exact path={path}>
          <MigrationPage />
        </Route>
      </Switch>
    </AppLayout>
  );
};

export default MigrationRouter;
