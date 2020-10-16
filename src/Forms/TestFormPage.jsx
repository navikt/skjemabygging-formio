import { Link } from "react-router-dom";
import React, { useState } from "react";
import NavForm from "../components/NavForm";
import { ToggleGruppe } from "nav-frontend-toggle";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import i18nData from "../i18nData";

export function TestFormPage({ onPublishClick, publiserer, editFormUrl, form, onSave }) {
  const title = `${form.title}`;
  const [readOnly, setReadOnly] = useState(false);
  const [submission, setSubmission] = useState();
  const readOnlyForm = form.display === "wizard" ? { ...form, display: "form" } : form;

  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true }}
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
      <ToggleGruppe
        defaultToggles={[
          { children: "Interaktiv", pressed: !readOnly },
          { children: "Oppsummering", pressed: readOnly },
        ]}
        minstEn={true}
        onChange={() => setReadOnly(!readOnly)}
      />
      <form>
        {readOnly ? (
          <NavForm
            key="2"
            form={readOnlyForm}
            options={{ readOnly: readOnly, language: "nb-NO", i18n: i18nData }}
            submission={{ data: submission }}
          />
        ) : (
          <NavForm key="1" form={form} onChange={(value) => setSubmission(value.data)} />
        )}
      </form>
    </AppLayoutWithContext>
  );
}
