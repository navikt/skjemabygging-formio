import { Link } from "react-router-dom";
import React from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import { FyllUtRouter } from "./FyllUtRouter";
import { AppConfigProvider } from "../configContext";

export function TestFormPage({ onPublishClick, publiserer, editFormUrl, form, onSave, logout }) {
  const title = `${form.title}`;
  const dokumentinnsendingDevURL = "https://tjenester-q0.nav.no/dokumentinnsending";

  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true, logout: logout }}
      mainCol={
        <>
          <Link className="knapp" to={editFormUrl}>
            Rediger
          </Link>
          <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
            Publiser
          </Knapp>
        </>
      }
    >
      <AppConfigProvider dokumentinnsendingBaseURL={dokumentinnsendingDevURL} featureToggles={{ sendPaaPapir: true }}>
        <FyllUtRouter form={form} />
      </AppConfigProvider>
    </AppLayoutWithContext>
  );
}
