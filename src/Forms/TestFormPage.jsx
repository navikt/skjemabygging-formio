import { Link, useHistory } from "react-router-dom";
import React from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import FyllUtRouter from "./FyllUtRouter";
import AmplitudeProvider from "../context/amplitude";
import { useModal } from "../util/useModal";
import ConfirmPublishModal from "./ConfirmPublishModal";
import { useTranslations } from "../context/i18n";
import { useAppConfig } from "../configContext";

const MainCol = ({ editFormUrl, form, onSave }) => {
  const { featureToggles } = useAppConfig();
  const history = useHistory();
  const params = new URLSearchParams(history.location.search);
  const currentLanguage = params.get("lang");
  return (
    <ul className="list-inline">
      <li className="list-inline-item">
        <Link className="knapp" to={editFormUrl}>
          Rediger
        </Link>
      </li>
      <li className="list-inline-item">
        <Hovedknapp onClick={() => onSave(form)}>Lagre</Hovedknapp>
      </li>
      {featureToggles.enableTranslations && (
        <li className="list-inline-item">
          <Link className="knapp" to={`/translations/${form.path}${currentLanguage ? `/${currentLanguage}` : ""}`}>
            Oversettelse
          </Link>
        </li>
      )}
    </ul>
  );
};

export function TestFormPage({ editFormUrl, form, onSave, onLogout, onPublish }) {
  const { featureToggles } = useAppConfig();
  const { translations } = useTranslations();
  const title = `${form.title}`;
  const [openModal, setOpenModal] = useModal(false);

  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}
      mainCol={<MainCol editFormUrl={editFormUrl} form={form} onSave={onSave} />}
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
