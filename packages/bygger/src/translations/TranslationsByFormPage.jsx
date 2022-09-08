import { makeStyles } from "@material-ui/styles";
import { LoadingComponent } from "@navikt/skjemadigitalisering-shared-components";
import { Knapp } from "nav-frontend-knapper";
import React, { useEffect, useMemo, useState } from "react";
import { CSVLink } from "react-csv";
import { useHistory, useParams } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import Column from "../components/layout/Column";
import Row from "../components/layout/Row";
import PrimaryButtonWithSpinner from "../components/PrimaryButtonWithSpinner";
import UserFeedback from "../components/UserFeedback";
import { getAvailableLanguages, languagesInNorwegian, useI18nState } from "../context/i18n";
import FormBuilderLanguageSelector from "../context/i18n/FormBuilderLanguageSelector";
import useRedirectIfNoLanguageCode from "../hooks/useRedirectIfNoLanguageCode";
import { useModal } from "../util/useModal";
import ConfirmDeleteLanguageModal from "./ConfirmDeleteLanguageModal";
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

const TranslationsByFormPage = ({ deleteTranslation, loadForm, saveTranslation }) => {
  const { formPath, languageCode } = useParams();
  const [isDeleteLanguageModalOpen, setIsDeleteLanguageModalOpen] = useModal();
  const [form, setForm] = useState();
  const [status, setStatus] = useState("LOADING");
  const history = useHistory();
  const { translations } = useI18nState();
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

  const flattenedComponents = getFormTexts(form, true);
  const translationId = (translations[languageCode] || {}).id;
  const styles = useStyles();

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
      <AppLayoutWithContext
        navBarProps={{
          title: "Rediger oversettelse",
          visSkjemaliste: false,
          visLagNyttSkjema: false,
          visOversettelseliste: true,
          visSkjemaMeny: true,
          links: [
            {
              label: "Innstillinger",
              url: `/forms/${path}/settings`,
            },
            {
              label: "Forhåndsvis",
              url: `/forms/${path}/view/veiledning`,
            },
            {
              label: "Rediger skjema",
              url: `/forms/${path}/edit`,
            },
            {
              label: "Språk",
              url: `/translations/${form.path}`,
            },
          ],
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
              <Knapp onClick={() => setIsDeleteLanguageModalOpen(true)}>Slett språk</Knapp>
              <PrimaryButtonWithSpinner
                onClick={() =>
                  saveTranslation(translationId, languageCode, translations[languageCode]?.translations, path, title)
                }
              >
                Lagre
              </PrimaryButtonWithSpinner>
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
      </AppLayoutWithContext>
      <ConfirmDeleteLanguageModal
        language={languagesInNorwegian[languageCode]}
        isOpen={isDeleteLanguageModalOpen}
        closeModal={() => setIsDeleteLanguageModalOpen(false)}
        onConfirm={() => deleteTranslation(translationId).then(() => history.push("/translations"))}
      />
    </>
  );
};

export default TranslationsByFormPage;
