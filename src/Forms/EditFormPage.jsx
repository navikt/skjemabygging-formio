import { NavBar } from "../components/NavBar";
import { Pagewrapper, NoScrollWrapper } from "./components";
import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React, { useState } from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import {ActionRow, ActionRowWrapper, MainCol, LeftCol, RightCol} from "./ActionRow";

export function EditFormPage({ form, testFormUrl, onSave, onChange, onPublish, testUserAlerter }) {
  const title = `${form.title}`;

  const [publiserer, setPubliserer] = useState(false);

  const onPublishClick = async (form) => {
    setPubliserer(true);
    try {
      await onPublish(form);
    } finally {
      setPubliserer(false);
    }
  };

  return (
    <>
      <NoScrollWrapper>
        <NavBar title={title} visSkjemaliste={true} visHamburger={true} visInnstillinger={true} />
        <ActionRow userAlerter={testUserAlerter}>
          <LeftCol>
              <SkjemaVisningSelect form={form} onChange={onChange} />
          </LeftCol>
          <MainCol>
            <Link className="knapp" to={testFormUrl}>
              Test skjema
            </Link>
            <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
            <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
              Publiser skjema
            </Knapp>
          </MainCol>

        </ActionRow>
      </NoScrollWrapper>
      <Pagewrapper>
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
      </Pagewrapper>
    </>
  );
}
