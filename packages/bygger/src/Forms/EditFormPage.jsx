import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useModal } from "../util/useModal";
import { useTranslations } from "../context/i18n";
import { useAppConfig } from "../configContext";

export function EditFormPage({ form, testFormUrl, onSave, onChange, onPublish, onLogout }) {
  const { featureToggles } = useAppConfig();
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);
  const { translationsForNavForm } = useTranslations();
  return (
    <>
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
            {featureToggles.enableTranslations && (
              <li className="list-inline-item">
                <Link className="knapp" to={`/translations/${form.path}`}>
                  Oversettelse
                </Link>
              </li>
            )}
          </ul>
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
