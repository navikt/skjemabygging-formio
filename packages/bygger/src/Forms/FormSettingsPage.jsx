import { AppLayoutWithContext } from "../components/AppLayout";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { AmplitudeProvider } from "@navikt/skjemadigitalisering-shared-components";
import { useModal } from "../util/useModal";
import { styled } from "@material-ui/styles";
import { FormMetadataEditor } from "../components/FormMetadataEditor";

const SettingsContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "800px",
});

const MainCol = ({ editFormUrl, testFormUrl, form, onSave }) => {
  return (
    <ul className="list-inline">
      <li className="list-inline-item">
        <Link className="knapp" to={editFormUrl}>
          Rediger
        </Link>
      </li>
      <li className="list-inline-item">
        <Link className="knapp" to={testFormUrl}>
          Test
        </Link>
      </li>
      <li className="list-inline-item">
        <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
      </li>
    </ul>
  );
};

export function FormSettingsPage({ editFormUrl, testFormUrl, form, onSave, onLogout, onPublish }) {
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);
  const [newForm, setNewForm] = useState(form);

  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}
      mainCol={
        <MainCol editFormUrl={editFormUrl} testFormUrl={testFormUrl} form={form} onSave={() => onSave(newForm)} />
      }
      rightCol={<Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>}
    >
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <SettingsContainer>
          <h1 className="typo-sidetittel">{title}</h1>
          <FormMetadataEditor form={newForm} onChange={setNewForm} />
        </SettingsContainer>
      </AmplitudeProvider>

      <ConfirmPublishModal
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        form={form}
        onPublish={onPublish}
      />
    </AppLayoutWithContext>
  );
}
