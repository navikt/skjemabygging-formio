import { makeStyles } from "@material-ui/styles";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import React, { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { useParams } from "react-router-dom";
import { AppLayout } from "../components/AppLayout";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import PrimaryButtonWithSpinner from "../components/PrimaryButtonWithSpinner";
import UserFeedback from "../components/UserFeedback";
import { getAvailableLanguages, useI18nState } from "../context/i18n";
import FormBuilderLanguageSelector from "../context/i18n/FormBuilderLanguageSelector";
import useRedirectIfNoLanguageCode from "../hooks/useRedirectIfNoLanguageCode";
import TranslationsFormPage from "./TranslationsFormPage";
import { getFormTexts, getTextsAndTranslationsForForm, getTextsAndTranslationsHeaders } from "./utils";

const useStyles = makeStyles({
  mainCol: {
    gridColumn: "2 / 3",
  },
  sideBarContainer: {
    height: "100%",
  },
  stickySideBar: {
    position: "sticky",
    top: "7rem",
  },
});

const TranslationsByFormPage = ({ loadForm, saveTranslation }) => {
  const { formPath, languageCode } = useParams();
  const [form, setForm] = useState();
  const [status, setStatus] = useState("LOADING");
  const { translations } = useI18nState();
  const [translationId, setTranslationId] = useState();
  const languages = useMemo(() => getAvailableLanguages(translations), [translations]);

  useRedirectIfNoLanguageCode(languageCode, translations);

  useEffect(() => {
    loadForm(formPath)
      .then((form) => {
        setForm(form);
        setStatus("FINISHED LOADING");
      })
      .catch((e) => {
        console.log(e);
        setStatus("FORM NOT FOUND");
      });
  }, [loadForm, formPath]);

  useEffect(() => {
    setTranslationId(translations[languageCode]?.id);
  }, [translations, languageCode]);

  const flattenedComponents = getFormTexts(form, true);
  const styles = useStyles();

  const onSave = async () => {
    const savedTranslation = await saveTranslation(
      translationId,
      languageCode,
      translations[languageCode]?.translations,
      path,
      title
    );
    setTranslationId(savedTranslation._id);
  };

  if (status === "LOADING") {
    return <LoadingComponent />;
  }

  if (status === "FORM NOT FOUND" || !form) {
    return <h1>Vi fant ikke dette skjemaet...</h1>;
  }

  const {
    title,
    path,
    properties: { skjemanummer },
  } = form;

  return (
    <>
      <AppLayout
        navBarProps={{
          title: "Rediger oversettelse",
          visSkjemaliste: false,
          visLagNyttSkjema: false,
          visOversettelseliste: true,
          visSkjemaMeny: true,
          formPath: form.path,
        }}
      >
        <Row>
          <Column className={styles.mainCol}>
            <TranslationsFormPage
              skjemanummer={skjemanummer}
              translations={translations}
              languageCode={languageCode}
              title={title}
              flattenedComponents={flattenedComponents}
            />
          </Column>
          <div className={styles.sideBarContainer}>
            <Column className={styles.stickySideBar}>
              <FormBuilderLanguageSelector languages={languages} formPath={path} label={""} />
              <PrimaryButtonWithSpinner onClick={onSave}>Lagre</PrimaryButtonWithSpinner>
              <UserFeedback />
              <CSVLink
                data={getTextsAndTranslationsForForm(form, translations)}
                filename={`${title}(${path})_Oversettelser.csv`}
                className="knapp knapp--standard"
                separator={";"}
                headers={getTextsAndTranslationsHeaders(translations)}
                enclosingCharacter={"'"}
              >
                Eksporter
              </CSVLink>
            </Column>
          </div>
        </Row>
      </AppLayout>
    </>
  );
};

export default TranslationsByFormPage;
