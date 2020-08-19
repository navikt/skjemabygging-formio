import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React, { useState } from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import {LeftColContent, MainColContent, NavBarProps} from "../components/AppLayout";

export function EditFormPage({ form, testFormUrl, onSave, onChange, onPublish }) {
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
      <LeftColContent>
        <SkjemaVisningSelect form={form} onChange={onChange} />
      </LeftColContent>
      <MainColContent>
        <Link className="knapp" to={testFormUrl}>
          Test skjema
        </Link>
        <Hovedknapp onClick={() => onSave(form)}>Lagre skjema</Hovedknapp>
        <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
          Publiser skjema
        </Knapp>
      </MainColContent>
      <NavBarProps title={title} visSkjemaliste={true} visHamburger={true} visInnstillinger={true} />
      <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
    </>
  );
}
