import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import FyllUtRouter from "./FyllUtRouter";
import AmplitudeProvider from "../context/amplitude";
import { useLanguages } from "../hooks";
import I18nProvider from "../context/i18n";

export function TestFormPage({
  onPublishClick,
  publiserer,
  editFormUrl,
  form,
  lang = "nb-NO",
  onSave,
  onLogout,
  loadTranslationsForFormAndMapToI18nObject,
}) {
  const title = `${form.title}`;
  const { currentLanguage } = useLanguages();
  useEffect(() => {
    if (window.setLanguage !== undefined) {
      window.setLanguage(currentLanguage);
    }
  }, [currentLanguage]);
  return (
    <I18nProvider loadTranslations={() => loadTranslationsForFormAndMapToI18nObject(form.path)}>
      <AppLayoutWithContext
        currentLanguage={currentLanguage}
        navBarProps={{ title: title, visSkjemaliste: true, logout: onLogout }}
        mainCol={
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
        }
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
