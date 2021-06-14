import React from "react";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import { flattenComponents } from "../util/forsteside";
import FormBuilderLanguageSelector from "../context/i18n/FormBuilderLanguageSelector";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import TranslationsFormPage from "./TranslationsFormPage";
import { useTranslations } from "../context/i18n";
import { LanguagesProvider } from "../context/languages";
import i18nData from "../i18nData";
import useRedirectIfNoLanguageCode from "../hooks/useRedirectIfNoLanguageCode";

const getAllTextsForForm = (form) =>
  flattenComponents(form.components)
    .filter((component) => !component.hideLabel)
    .map(({ content, title, label, html, type, values, legend, description }) => ({
      title,
      label: ["panel", "htmlelement", "content", "fieldset"].indexOf(type) === -1 ? label : undefined,
      html,
      values: values ? values.map((value) => value.label) : undefined,
      content,
      legend,
      description: description !== "" ? description : undefined,
    }))
    .reduce((allTextsForForm, component) => {
      return [
        ...allTextsForForm,
        ...Object.keys(component)
          .filter((key) => component[key] !== undefined)
          .reduce((textsForComponent, key) => {
            if (key === "values") {
              return [
                ...textsForComponent,
                ...component[key].map((value) => ({
                  text: value,
                  type: value.length < 80 ? "text" : "textarea",
                })),
              ];
            } else {
              return [
                ...textsForComponent,
                { text: component[key], type: component[key].length < 80 ? "text" : "textarea" },
              ];
            }
          }, []),
      ];
    }, [])
    .filter(
      (component, index, currentComponents) =>
        index === currentComponents.findIndex((currentComponent) => currentComponent.text === component.text)
    );

const TranslationsByFormPage = ({ deleteTranslation, saveTranslation, form, languageCode, projectURL }) => {
  const history = useHistory();
  const {
    title,
    path,
    properties: { skjemanummer },
  } = form;
  const flattenedComponents = getAllTextsForForm(form);
  const { translations, setTranslations } = useTranslations();
  useRedirectIfNoLanguageCode(languageCode, translations);
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
