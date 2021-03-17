import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import { AppLayoutWithContext } from "../components/AppLayout";
import FyllUtRouter from "./FyllUtRouter";
import AmplitudeProvider from "../context/amplitude";

export function TestFormPage({
  onPublishClick,
  publiserer,
  editFormUrl,
  form,
  onSave,
  onLogout,
  loadTranslationsForFormAndMapToI18nObject,
}) {
  const title = `${form.title}`;
  const [translation, setTranslation] = useState();
  const [availableTranslations, setAvailableTranslations] = useState();
  useEffect(() => {
    loadTranslationsForFormAndMapToI18nObject(form.path).then((translations) => {
      setTranslation(translations);
      setAvailableTranslations(Object.keys(translations.resources));
    });
  }, [form.path, loadTranslationsForFormAndMapToI18nObject, setTranslation]);
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
            <Knapp onClick={() => onPublishClick(form)} spinner={publiserer}>
              Publiser
            </Knapp>
          </li>
        </ul>
      }
    >
      <AmplitudeProvider form={form} shouldUseAmplitude={true}>
        <FyllUtRouter form={form} translation={translation} />
      </AmplitudeProvider>
    </AppLayoutWithContext>
  );
}
