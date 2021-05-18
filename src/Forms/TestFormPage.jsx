import { Link } from "react-router-dom";
import React, { useEffect } from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import FyllUtRouter from "./FyllUtRouter";
import AmplitudeProvider from "../context/amplitude";
import { useLanguages } from "../hooks";
import I18nProvider, { useTranslations } from "../context/i18n";

const MainCol = ({ editFormUrl, form, onSave }) => {
  const { currentLanguage } = useTranslations();
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

export function TestFormPage({
  onPublishClick,
  publiserer,
  editFormUrl,
  form,
  lang = "nb-NO",
  onSave,
  onLogout,
  loadTranslations,
}) {
  const title = `${form.title}`;
  return (
    <I18nProvider loadTranslations={() => loadTranslations(form.path)}>
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
          <FyllUtRouter form={form} />
        </AmplitudeProvider>
      </AppLayoutWithContext>
    </I18nProvider>
  );
}
