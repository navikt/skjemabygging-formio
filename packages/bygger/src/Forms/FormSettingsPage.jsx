import { AppLayoutWithContext } from "../components/AppLayout";
import { Knapp } from "nav-frontend-knapper";
import React from "react";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { AmplitudeProvider } from "@navikt/skjemadigitalisering-shared-components";
import { useModal } from "../util/useModal";
import { styled } from "@material-ui/styles";
import { FormMetadataEditor } from "../components/FormMetadataEditor";
import { FormEditNavigation } from "./FormEditNavigation";

const SettingsContainer = styled("div")({
  margin: "0 auto",
  maxWidth: "800px",
});

export function FormSettingsPage({ editFormUrl, testFormUrl, form, onSave, onChange, onLogout, onPublish }) {
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);

  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}
      mainCol={<FormEditNavigation editFormUrl={editFormUrl} testFormUrl={testFormUrl} form={form} onSave={onSave} />}
      rightCol={<Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>}
    >
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <SettingsContainer>
          <h1 className="typo-sidetittel">{title}</h1>
          <FormMetadataEditor form={form} onChange={onChange} />
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
