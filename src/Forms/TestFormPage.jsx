import {MenuLink, NavBar} from "../components/NavBar";
import {Pagewrapper, RightAlignedActionRow} from "./components";
import Form from "../react-formio/Form";
import {Link} from "react-router-dom";
import React from "react";

export function TestFormPage({logout, editFormUrl, form, onSave}) {
    return (
        <>
            <NavBar>
                <MenuLink to="/forms">Skjemaer</MenuLink>
                <MenuLink to="/" onClick={logout}>
                    Logout
                </MenuLink>
            </NavBar>
            <Pagewrapper>
                <Form form={form}/>
                <RightAlignedActionRow>
                    <button onClick={() => onSave(form)}>Lagre skjema</button>
                    <Link to={editFormUrl}>Rediger skjema</Link>
                </RightAlignedActionRow>
            </Pagewrapper>
        </>
    );
}