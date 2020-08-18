import {NavBar} from "../components/NavBar";
import {Pagewrapper, NoScrollWrapper} from "./components";
import {Link} from "react-router-dom";
import React from "react";
import NavForm from "../components/NavForm";
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {ActionRow, ActionRowWrapper, MainCol} from "../components/ActionRow";

export function TestFormPage({ onPublishClick, publiserer, editFormUrl, form, onSave, userAlerter}) {
  const title = `${form.title}`;
  return (
        <>
          <NoScrollWrapper>
            <NavBar title={title} visSkjemaliste={true} />
            <ActionRow userAlerter={userAlerter}>
              <MainCol>
                <Link className="knapp" to={editFormUrl}>Rediger skjema</Link>
                <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
                <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
                  Publiser skjema
                </Knapp>
              </MainCol>
            </ActionRow>
          </NoScrollWrapper>
            <Pagewrapper>
                <NavForm form={form}/>
            </Pagewrapper>
        </>
    );
}