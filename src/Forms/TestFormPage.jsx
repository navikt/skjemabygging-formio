import {Link} from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {AppLayoutWithContext} from "../components/AppLayout";

export function TestFormPage({onPublishClick, publiserer, editFormUrl, form, onSave, userAlerter}) {
  const title = `${form.title}`;
  return (
    <AppLayoutWithContext
      navBarProps={{title: title, visSkjemaliste: true}}
      mainCol={<>
      <Link className="knapp" to={editFormUrl}>Rediger skjema</Link>
        <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
        <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
        Publiser skjema
        </Knapp>
      </>}>
      <NavForm form={form}/>
    </AppLayoutWithContext>
  );
}