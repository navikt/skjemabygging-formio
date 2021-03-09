import { Link } from "react-router-dom";
import { SkjemaVisningSelect } from "../components/FormMetadataEditor";
import NavFormBuilder from "../components/NavFormBuilder";
import React from "react";
import FormBuilderOptions from "./FormBuilderOptions";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useModal } from "../util/useModal";
import LanguageSelector from "../components/LanguageSelector";

export function EditFormPage({ form, testFormUrl, onSave, onChange, onPublish, onLogout }) {
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);
  console.log("Form", form);
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
            <li className="list-inline-item">
              <Knapp onClick={() => setOpenModal(true)}>Publiser</Knapp>
            </li>
          </ul>
        }
        rightCol={
          <LanguageSelector changeLanguage={form.i18next && form.i18next.changeLanguage} language={form.language} />
        }
        navBarProps={{
          title: title,
          visSkjemaliste: true,
          visHamburger: true,
          visInnstillinger: true,
          logout: onLogout,
        }}
      >
        <NavFormBuilder form={form} onChange={onChange} formBuilderOptions={FormBuilderOptions} />
      </AppLayoutWithContext>

      <ConfirmPublishModal
        openModal={openModal}
        closeModal={() => setOpenModal(false)}
        form={form}
        onPublish={onPublish}
      />
    </>
  );
}
