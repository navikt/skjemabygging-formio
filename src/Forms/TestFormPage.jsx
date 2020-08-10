import {NavBar} from "../components/NavBar";
import {Pagewrapper, CenterAlignedActionRow} from "./components";
import {Link} from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import {Hovedknapp} from "nav-frontend-knapper";

export function TestFormPage({logout, editFormUrl, form, onSave}) {
    return (
        <>
            <NavBar title={form && form.title}>
                <Link className="knapp" to="/forms">Skjemaer</Link>
                <Link className="knapp" to="/" onClick={logout}>
                    Logout
                </Link>
            </NavBar>
          <CenterAlignedActionRow>
            <Link className="knapp" to={editFormUrl}>Rediger skjema</Link>
            <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
          </CenterAlignedActionRow>
            <Pagewrapper>
                <NavForm form={form}/>
            </Pagewrapper>
        </>
    );
}