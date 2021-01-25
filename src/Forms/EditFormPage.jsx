import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React, { useState } from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";

export function EditFormPage({ form, testFormUrl, onSave, onChange, onPublish, logout }) {
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
        <ul className="list-inline">
          <li className="list-inline-item">
            <Link className="knapp" to={testFormUrl}>
              Test
            </Link>
          </li>
          <li className="list-inline-item">
            <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
          </li>
          <li className="list-inline-item">
            <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
              Publiser
            </Knapp>
          </li>
        </ul>
      }
      navBarProps={{
        title: title,
        visSkjemaliste: true,
        visHamburger: true,
        visInnstillinger: true,
        logout: logout,
      }}
    >
      <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
    </AppLayoutWithContext>
  );
}
