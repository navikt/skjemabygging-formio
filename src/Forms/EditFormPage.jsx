import {MenuLink, NavBar} from "../components/NavBar";
import {Pagewrapper, RightAlignedActionRow} from "./components";
import {Link} from "react-router-dom";
import {FormMetadataEditor} from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";

export function EditFormPage({logout, onSave, form, testFormUrl, onChange}) {
    return (
        <>
            <NavBar title={form && form.title}>
                <MenuLink to="/forms">Skjemaer</MenuLink>
                <MenuLink to="/" onClick={logout}>
                    Logout
                </MenuLink>
            </NavBar>
            <Pagewrapper>
                <RightAlignedActionRow>
                    <button onClick={() => onSave(form)}>Lagre skjema</button>
                    <Link to={testFormUrl}>Test skjema</Link>
                </RightAlignedActionRow>
                <>
                    {form && (
                        <>
                            <FormMetadataEditor form={form} onChange={onChange}/>
                            <NavFormBuilder form={form} onChange={onChange}/>
                        </>
                    )}
                </>
                <RightAlignedActionRow>
                    <button onClick={() => onSave(form)}>Lagre skjema</button>
                    <Link to={testFormUrl}>Test skjema</Link>
                </RightAlignedActionRow>
            </Pagewrapper>
        </>
    );
}