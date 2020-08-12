import { MenuLink, NavBar } from "../components/NavBar";
import { Pagewrapper } from "../components/Pagewrapper";
import { RightAlignedActionRow } from "./EditFormPage";
import { Link } from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import Knapp from "nav-frontend-knapper";

export function TestFormPage({ logout, editFormUrl, form, onSave }) {
  return (
    <>
      <NavBar title={form && form.title}>
        <MenuLink to="/forms">Skjemaer</MenuLink>
        <MenuLink to="/" onClick={logout}>
          Logout
        </MenuLink>
      </NavBar>
      <Pagewrapper>
        <NavForm form={form} />
        <RightAlignedActionRow>
          <Knapp onClick={() => onSave(form)}>Lagre skjema</Knapp>
          <Link to={editFormUrl}>Rediger skjema</Link>
        </RightAlignedActionRow>
      </Pagewrapper>
    </>
  );
}
