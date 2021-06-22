import React from "react";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import {
  FormBuilderLanguageSelector,
  useTranslations,
  LanguagesProvider,
  i18nData,
} from "@navikt/skjemadigitalisering-shared-components";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import TranslationsFormPage from "./TranslationsFormPage";
import useRedirectIfNoLanguageCode from "../hooks/useRedirectIfNoLanguageCode";
import { getAllTextsForForm } from "./utils";

const TranslationsByFormPage = ({ deleteTranslation, saveTranslation, form, languageCode, projectURL }) => {
  const history = useHistory();
  const {
    title,
    path,
    properties: { skjemanummer },
  } = form;
  const { translations, setTranslations } = useTranslations();
  useRedirectIfNoLanguageCode(languageCode, translations);
  const flattenedComponents = getAllTextsForForm(form);
  const translationId = (translations[languageCode] || {}).id;
  return (
    <LanguagesProvider translations={i18nData}>
      <AppLayoutWithContext
        navBarProps={{
          title: "Rediger oversettelse",
          visSkjemaliste: false,
          visLagNyttSkjema: false,
          visOversettelseliste: true,
        }}
        leftCol={
          <>
            <FormBuilderLanguageSelector formPath={path} label={""} />
            <Knapp onClick={() => deleteTranslation(translationId).then(() => history.push("/translations"))}>
              Slett språk
            </Knapp>
          </>
        }
        mainCol={
          <ul className="list-inline">
            <li className="list-inline-item">
              <Link className="knapp" to={`/forms/${path}/edit`}>
                Rediger skjema
              </Link>
            </li>
            <li className="list-inline-item">
              <Hovedknapp
                onClick={() => {
                  saveTranslation(
                    projectURL,
                    translationId,
                    languageCode,
                    translations[languageCode].translations,
                    path,
                    title
                  );
                }}
              >
                Lagre
              </Hovedknapp>
            </li>
            <li className="list-inline-item">
              <Link className="knapp" to={`/forms/${path}/view${languageCode ? `?lang=${languageCode}` : ""}`}>
                Vis skjema
              </Link>
            </li>
          </ul>
        }
      >
        <TranslationsFormPage
          skjemanummer={skjemanummer}
          translations={translations}
          languageCode={languageCode}
          title={title}
          flattenedComponents={flattenedComponents}
          setTranslations={setTranslations}
        />
      </AppLayoutWithContext>
    </LanguagesProvider>
  );
};

export default TranslationsByFormPage;
