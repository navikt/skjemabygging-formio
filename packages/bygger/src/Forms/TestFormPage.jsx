import { Link, useHistory } from "react-router-dom";
import React from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import { FyllUtRouter, AmplitudeProvider, useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { useModal } from "../util/useModal";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useTranslations } from "../context/i18n";
import { FormEditNavigation } from "./FormEditNavigation";

export function TestFormPage({ editFormUrl, formSettingsUrl, form, onSave, onLogout, onPublish }) {
  const { featureToggles } = useAppConfig();
  const { translations } = useTranslations();
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);

  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}
      mainCol={
        <FormEditNavigation editFormUrl={editFormUrl} formSettingsUrl={formSettingsUrl} form={form} onSave={onSave} />
      }
      rightCol={<Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>}
    >
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <FyllUtRouter form={form} translations={featureToggles.enableTranslations ? translations : undefined} />
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
