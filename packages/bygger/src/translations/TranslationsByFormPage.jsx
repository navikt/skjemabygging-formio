import React, { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { AppLayoutWithContext } from "../components/AppLayout";
import { Hovedknapp, Knapp } from "nav-frontend-knapper";
import TranslationsFormPage from "./TranslationsFormPage";
import useRedirectIfNoLanguageCode from "../hooks/useRedirectIfNoLanguageCode";
import { getTextsAndTranslationsForForm, getTextsAndTypeForForm, getTextsAndTranslationsHeaders } from "./utils";
import FormBuilderLanguageSelector from "../context/i18n/FormBuilderLanguageSelector";
import { languagesInNorwegian, useTranslations } from "../context/i18n";
import ActionRow from "../components/layout/ActionRow";
import Row from "../components/layout/Row";
import Column from "../components/layout/Column";
import { makeStyles } from "@material-ui/styles";
import { UserAlerterContext } from "../userAlerting";
import { CSVLink } from "react-csv";
import ConfirmDeleteLanguageModal from "./ConfirmDeleteLanguageModal";
import { useModal } from "../util/useModal";

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

const TranslationsByFormPage = ({ deleteTranslation, saveTranslation, form, languageCode, projectURL, onLogout }) => {
  const [isDeleteLanguageModalOpen, setIsDeleteLanguageModalOpen] = useModal();

  const userAlerter = useContext(UserAlerterContext);
  const alertComponent = userAlerter.alertComponent();
  const history = useHistory();
  const {
    title,
    path,
    properties: { skjemanummer },
  } = form;
  const { translations, setTranslations } = useTranslations();
  useRedirectIfNoLanguageCode(languageCode, translations);
  const flattenedComponents = getTextsAndTypeForForm(form);
  const translationId = (translations[languageCode] || {}).id;
  const styles = useStyles();
  return (
    <>
      <AppLayoutWithContext
        navBarProps={{
          title: "Rediger oversettelse",
          visSkjemaliste: false,
          visLagNyttSkjema: false,
          visOversettelseliste: true,
          logout: onLogout,
        }}
      >
        <ActionRow>
          <Link className="knapp" to={`/forms/${path}/edit`}>
            Rediger skjema
          </Link>
          <Link className="knapp" to={`/forms/${path}/view${languageCode ? `?lang=${languageCode}` : ""}`}>
            Forhåndsvis
          </Link>
        </ActionRow>
        <Row>
          <Column className={styles.mainCol}>
            <TranslationsFormPage
              skjemanummer={skjemanummer}
              translations={translations}
              languageCode={languageCode}
              title={title}
              flattenedComponents={flattenedComponents}
              setTranslations={setTranslations}
            />
          </Column>
          <div className={styles.sideBarContainer}>
            <Column className={styles.stickySideBar}>
              <FormBuilderLanguageSelector className={styles.languageSelector} formPath={path} label={""} />
              <Knapp onClick={() => setIsDeleteLanguageModalOpen(true)}>Slett språk</Knapp>
              <Hovedknapp
                onClick={() => {
                  saveTranslation(
                    projectURL,
                    translationId,
                    languageCode,
                    translations[languageCode]?.translations,
                    path,
                    title
                  );
                }}
              >
                Lagre
              </Hovedknapp>
              {alertComponent && <aside aria-live="polite">{alertComponent()}</aside>}
              <CSVLink
                data={getTextsAndTranslationsForForm(form, translations)}
                filename={`${title}(${path})_Oversettelser.csv`}
                className="knapp knapp--standard"
                separator={";"}
                headers={getTextsAndTranslationsHeaders(translations)}
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
