import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import { FormBuilderOptions } from "@navikt/skjemadigitalisering-shared-components";
import { Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useModal } from "../util/useModal";
import { useTranslations } from "../context/i18n";
import { FormEditNavigation } from "./FormEditNavigation";

export function EditFormPage({ form, testFormUrl, formSettingsUrl, onSave, onChange, onPublish, onLogout }) {
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);
  const { translationsForNavForm } = useTranslations();
  return (
    <>
      <AppLayoutWithContext
        leftCol={<SkjemaVisningSelect form={form} onChange={onChange} />}
        mainCol={
          <FormEditNavigation testFormUrl={testFormUrl} formSettingsUrl={formSettingsUrl} form={form} onSave={onSave} />
        }
        rightCol={<Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>}
        navBarProps={{
          title: title,
          visSkjemaliste: true,
          logout: onLogout,
        }}
      >
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
      </AppLayoutWithContext>

      <ConfirmPublishModal
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        form={form}
        translations={translationsForNavForm}
        onPublish={onPublish}
      />
    </>
  );
}
