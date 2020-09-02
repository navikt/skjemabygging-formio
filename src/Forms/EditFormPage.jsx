import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React, { useState } from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import {AppLayoutWithContext} from "../components/AppLayout";

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
    <AppLayoutWithContext
      leftCol={<SkjemaVisningSelect form={form} onChange={onChange} />}
      mainCol={
        <>
          <Link className="knapp" to={testFormUrl}>
            Test
          </Link>
          <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
            Publiser
          </Knapp>
        </>
      }
      navBarProps={{
        title: title,
        visSkjemaliste: true,
        visHamburger: true,
        visInnstillinger: true,
      }}
    >
      <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
    </AppLayoutWithContext>
  );
}
