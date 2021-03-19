import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import FyllUtRouter from "./FyllUtRouter";
import AmplitudeProvider from "../context/amplitude";
import { useLanguages } from "../hooks";

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
  const [translations, setTranslations] = useState();
  const [availableTranslations, setAvailableTranslations] = useState();
  useEffect(() => {
    loadTranslationsForFormAndMapToI18nObject(form.path).then((translations) => {
      setTranslations(translations);
      setAvailableTranslations(Object.keys(translations.resources));
    });
  }, [form.path, lang, loadTranslationsForFormAndMapToI18nObject, setTranslations]);
  const { currentLanguage } = useLanguages();
  useEffect(() => {
    if (window.setLanguage !== undefined) {
      window.setLanguage(currentLanguage);
    }
  }, [currentLanguage]);
  return (
    <AppLayoutWithContext
      translations={availableTranslations}
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
        <FyllUtRouter form={form} translation={translations} />
      </AmplitudeProvider>
    </AppLayoutWithContext>
  );
}
