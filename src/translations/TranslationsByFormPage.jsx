import React, { useEffect, useState } from "react";
import Formiojs from "formiojs/Formio";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import { flattenComponents } from "../util/forsteside";
import { Input, Textarea } from "nav-frontend-skjema";
import { Sidetittel } from "nav-frontend-typografi";
import LanguageSelector from "../components/LanguageSelector";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";

const getAllTextsForForm = (form) =>
  flattenComponents(form.components)
    .map(({ content, title, label, html, type, values, legend }) => ({
      title,
      label: ["panel", "htmlelement", "content", "fieldset"].indexOf(type) === -1 ? label : undefined,
      html,
      values: values ? values.map((value) => value.label) : undefined,
      content,
      legend,
    }))
    .reduce((allTextsForForm, component) => {
      return [
        ...allTextsForForm,
        ...Object.keys(component)
          .filter((key) => component[key] !== undefined)
          .reduce((textsForComponent, key) => {
            if (key === "values") {
              return [...textsForComponent, ...component[key].map((value) => ({ text: value, type: "text" }))];
            } else if (key === "html" || key === "content") {
              return [...textsForComponent, { text: component[key], type: "textarea" }];
            } else {
              return [...textsForComponent, { text: component[key], type: "text" }];
            }
          }, []),
      ];
    }, []);

const saveTranslation = (projectUrl, formPath, translationId, languageCode, translations) => {
  Formiojs.fetch(`${projectUrl}/language/submission${translationId ? `/${translationId}` : ""}`, {
    headers: {
      "x-jwt-token": Formiojs.getToken(),
      "content-type": "application/json",
    },
    method: translationId ? "PUT" : "POST",
    body: JSON.stringify({
      data: {
        form: formPath,
        name: `global.${formPath}`,
        language: languageCode,
        scope: "local",
        i18n: Object.keys(translations).reduce((translationsToSave, translatedText) => {
          if (translations[translatedText].scope === "local" && translations[translatedText].value) {
            return {
              ...translationsToSave,
              [translatedText]: translations[translatedText].value,
            };
          } else {
            return translationsToSave;
          }
        }, {}),
      },
    }),
  });
};

const TranslationsByFormPage = ({
  deleteLanguage,
  form,
  loadTranslationsForEditPage,
  languageCode = "nb-NO",
  projectURL,
}) => {
  const history = useHistory();
  const {
    title,
    path,
    properties: { skjemanummer },
  } = form;
  const flattenedComponents = getAllTextsForForm(form);
  const [translations, setTranslations] = useState([]);
  const [translationId, setTranslationId] = useState();
  const [availableTranslations, setAvailableTranslations] = useState([]);

  useEffect(() => {
    loadTranslationsForEditPage(form.path).then((translations) => {
      console.log("TranslationsByFormPage", translations);
      setTranslations(translations[languageCode] ? translations[languageCode].translations : {});
      setTranslationId(translations[languageCode] ? translations[languageCode].id : undefined);
      setAvailableTranslations(Object.keys(translations));
    });
  }, [form.path, loadTranslationsForEditPage, languageCode]);

  const languages = [
    {
      href: `/translation/${path}/nn-NO`,
      optionLabel: `${availableTranslations.indexOf("nn-NO") === -1 ? `Legg til ` : ""}Nynorsk - Norsk`,
    },
    {
      href: `/translation/${path}/en`,
      optionLabel: `${availableTranslations.indexOf("en") === -1 ? `Legg til ` : ""}Engelsk`,
    },
    {
      href: `/translation/${path}/pl`,
      optionLabel: `${availableTranslations.indexOf("pl") === -1 ? `Legg til ` : ""}Polsk`,
    },
  ];

  return (
    <AppLayoutWithContext
      navBarProps={{
        title: "Rediger oversettelse",
        visSkjemaliste: false,
        visLagNyttSkjema: false,
        visOversettelseliste: true,
      }}
      leftCol={
        <>
          <LanguageSelector translations={languages} />
          <Knapp onClick={() => deleteLanguage(translationId).then(() => history.push("/translations"))}>
            Slett språk
          </Knapp>
        </>
      }
      mainCol={
        <ul className="list-inline">
          <li className="list-inline-item">
            <Link className="knapp" to={`/forms/${path}/view`}>
              Vis skjema
            </Link>
          </li>
          <li className="list-inline-item">
            <Hovedknapp onClick={() => saveTranslation(projectURL, path, translationId, languageCode, translations)}>
              Lagre
            </Hovedknapp>
          </li>
          <li className="list-inline-item">
            <Link className="knapp" to={`/forms/${path}/edit`}>
              Rediger skjema
            </Link>
          </li>
        </ul>
      }
    >
      <Sidetittel className="margin-bottom-large">
        {skjemanummer} {title}
      </Sidetittel>
      <form>
        {flattenedComponents.map(({ text, type }) => {
          if (type === "textarea")
            return (
              <Textarea
                label={text}
                className="margin-bottom-default"
                description={
                  translations[text] && translations[text].scope === "global"
                    ? "Denne teksten er global oversatt"
                    : undefined
                }
                value={(translations[text] && translations[text].value) || ""}
                onChange={(event) =>
                  setTranslations({
                    ...translations,
                    [text]: { value: event.target.value, scope: "local" },
                  })
                }
                readOnly={(translations && translations[text] && translations[text].scope === "global") || undefined}
              />
            );
          return (
            <Input
              className="margin-bottom-default"
              description={
                translations && translations[text] && translations[text].scope === "global"
                  ? "Denne teksten er global oversatt"
                  : undefined
              }
              label={text}
              type={type}
              value={(translations && translations[text] && translations[text].value) || ""}
              onChange={(event) =>
                setTranslations({
                  ...translations,
                  [text]: { value: event.target.value, scope: "local" },
                })
              }
              readOnly={(translations && translations[text] && translations[text].scope === "global") || undefined}
            />
          );
        })}
      </form>
    </AppLayoutWithContext>
  );
};

export default TranslationsByFormPage;
