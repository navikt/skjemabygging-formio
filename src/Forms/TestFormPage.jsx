import { Link, useHistory } from "react-router-dom";
import React from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import FyllUtRouter from "./FyllUtRouter";
import AmplitudeProvider from "../context/amplitude";
import { useTranslations } from "../context/i18n";

const MainCol = ({ editFormUrl, form, onSave }) => {
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
      <li className="list-inline-item">
        <Link className="knapp" to={`/translation/${form.path}${currentLanguage ? `/${currentLanguage}` : ""}`}>
          Oversettelse
        </Link>
      </li>
    </ul>
  );
};

export function TestFormPage({ onPublishClick, publiserer, editFormUrl, form, onSave, onLogout }) {
  const { translations } = useTranslations();
  const title = `${form.title}`;
  return (
    <AppLayoutWithContext
      navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}
      mainCol={<MainCol editFormUrl={editFormUrl} form={form} onSave={onSave} />}
      rightCol={
        <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
          Publiser
        </Knapp>
      }
    >
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <FyllUtRouter form={form} translations={translations} />
      </AmplitudeProvider>
    </AppLayoutWithContext>
  );
}
