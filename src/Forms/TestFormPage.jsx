import {MenuLink, NavBar} from "../components/NavBar";
import {Pagewrapper, RightAlignedActionRow} from "./components";
import {Link} from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";

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
                <NavForm form={form}/>
                <RightAlignedActionRow>
                    <button onClick={() => onSave(form)}>Lagre skjema</button>
                    <Link to={editFormUrl}>Rediger skjema</Link>
                </RightAlignedActionRow>
            </Pagewrapper>
        </>
    );
}