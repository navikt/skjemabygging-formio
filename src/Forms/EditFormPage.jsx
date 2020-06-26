import {MenuLink, NavBar} from "../components/NavBar";
import {Pagewrapper, RightAlignedActionRow} from "./components";
import {Link} from "react-router-dom";
import {FormMetadataEditor} from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";

export function EditFormPage({form, testFormUrl, logout, onSave, onChange, onPublish}) {
  const title = `Rediger skjema: ${form.title}`
  return (
    <>
      <NavBar title={title}>
        <MenuLink to="/forms">Skjemaer</MenuLink>
        <MenuLink to="/" onClick={logout}>
          Logg ut
        </MenuLink>
      </NavBar>
      <Pagewrapper>
        <RightAlignedActionRow>
          <button onClick={() => onSave(form)}>Lagre skjema</button>
          <Link to={testFormUrl}>Test skjema</Link>
        </RightAlignedActionRow>
        <FormMetadataEditor form={form} onChange={onChange}/>
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions}/>
        <RightAlignedActionRow>
          <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
          <Link to={testFormUrl}>Test skjema</Link>
          <Knapp onClick={() => onPublish(form)}>Publiser skjema</Knapp>
        </RightAlignedActionRow>
      </Pagewrapper>
    </>
  );
}