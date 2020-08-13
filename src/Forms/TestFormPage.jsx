import {NavBar} from "../components/NavBar";
import {Pagewrapper, CenterAlignedActionRow} from "./components";
import {Link} from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import { ActionRowWrapper, MainCol, LeftCol, NoScrollWrapper} from "./ActionRow";
import {SkjemaVisningSelect} from "../components/FormMetadataEditor";

export function TestFormPage({onChange, onPublishClick, publiserer, logout, editFormUrl, form, onSave}) {
  const title = `${form.title}`;
  return (
        <>
          <NoScrollWrapper>
            <NavBar title={title} visSkjemaliste={true} />
            <ActionRowWrapper>
              <LeftCol>
                <SkjemaVisningSelect form={form} onChange={onChange} />
              </LeftCol>
              <MainCol>
                <Link className="knapp" to={editFormUrl}>Rediger skjema</Link>
                <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
                <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
                  Publiser skjema
                </Knapp>
              </MainCol>
            </ActionRowWrapper>
          </NoScrollWrapper>
            <Pagewrapper>
                <NavForm form={form}/>
            </Pagewrapper>
        </>
    );
}



/*
<NavBar title={form && form.title}>
  <Link className="knapp" to="/forms">Skjemaer</Link>
  <Link className="knapp" to="/" onClick={logout}>
    Logout
  </Link>
</NavBar>
<CenterAlignedActionRow>
  <Link className="knapp" to={editFormUrl}>Rediger skjema</Link>
  <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
</CenterAlignedActionRow>*/
