import {Link} from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {MainColContent, NavBarProps} from "../components/AppLayout";

export function TestFormPage({onPublishClick, publiserer, editFormUrl, form, onSave, userAlerter}) {
  const title = `${form.title}`;
  return (
    <>
      <MainColContent>
        <Link className="knapp" to={editFormUrl}>Rediger skjema</Link>
        <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
        <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
          Publiser skjema
        </Knapp>
      </MainColContent>
      <NavBarProps title={title} visSkjemaliste={true} />
      <NavForm form={form}/>
    </>
  );
}