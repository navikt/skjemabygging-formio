import { makeStyles } from "@material-ui/styles";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { FormPropertiesType, I18nTranslations, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { AlertStripeAdvarsel } from "nav-frontend-alertstriper";
import { Hovedknapp } from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import { Checkbox, CheckboxGruppe } from "nav-frontend-skjema";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { languagesInNorwegian, useI18nState } from "../../context/i18n";
import { getFormTexts } from "../../translations/utils";
import FormStatus, { determineStatus } from "../status/FormStatus";
import { allLanguagesInNorwegian } from "../status/PublishedLanguages";
import { useStatusStyles } from "../status/styles";
import Timestamp from "../status/Timestamp";

const useModalStyles = makeStyles({
  modal_button: {
    float: "right",
    margin: "1rem",
  },
  languageList: {
    margin: 0,
  },
});

const useStatusPanelStyles = makeStyles({
  panel: {
    display: "flex",
    padding: "0 0.5rem",
    margin: "2rem 0",
    backgroundColor: "var(--navds-semantic-color-canvas-background)",
  },
  table: {
    width: "100%",
  },
});

interface Props {
  form: NavFormType;
  openModal: boolean;
  closeModal: () => void;
  onPublish: (languageCodes: string[]) => void;
}

export const getCompleteTranslationLanguageCodeList = (
  allFormOriginalTexts: string[],
  translationsForNavForm: I18nTranslations
): string[] => {
  const completeTranslationList: string[] = [];
  if (allFormOriginalTexts.length !== 0) {
    Object.keys(translationsForNavForm)
      .filter((lang) => lang !== "nb-NO")
      .forEach((languageCode) => {
        const incompleteTranslationList: string[] = allFormOriginalTexts.filter(
          (formText) => Object.keys(translationsForNavForm[languageCode]).indexOf(formText) < 0
        );

        if (incompleteTranslationList.length === 0) {
          completeTranslationList.push(languageCode);
        }
      });
  }
  return completeTranslationList;
};

const PublishSettingsModal = ({ openModal, closeModal, onPublish, form }: Props) => {
  const styles = useModalStyles();
  const { translationsForNavForm } = useI18nState();
  const [allFormOriginalTexts, setAllFormOriginalTexts] = useState<string[]>([]);
  const [completeTranslationLanguageCodeList, setCompleteTranslationLanguageCodeList] = useState<string[]>([]);
  const [checkedLanguages, setCheckedLanguages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setAllFormOriginalTexts(
      getFormTexts(form).reduce((allTexts, texts) => {
        const { text } = texts;
        return [...allTexts, text];
      }, [])
    );
  }, [form]);

  useEffect(() => {
    const completeTranslations = getCompleteTranslationLanguageCodeList(allFormOriginalTexts, translationsForNavForm);
    setCompleteTranslationLanguageCodeList(completeTranslations);
    setCheckedLanguages(
      completeTranslations.reduce(
        (acc, languageCode) => ({
          ...acc,
          [languageCode]: true,
        }),
        {}
      )
    );
  }, [allFormOriginalTexts, translationsForNavForm]);

  const PublishStatusPanel = ({ formProperties }: { formProperties: FormPropertiesType }) => {
    const statusPanelStyles = useStatusPanelStyles();
    const statusStyles = useStatusStyles();
    return (
      <Panel className={statusPanelStyles.panel}>
        <table className={statusPanelStyles.table}>
          <thead>
            <tr>
              <th>Status</th>
              <th>Publiserte språk</th>
              <th>Sist lagret</th>
              <th>Sist publisert</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <FormStatus status={determineStatus(formProperties)} size="large" />
              </td>
              <td>
                {formProperties.published && (
                  <ul className={styles.languageList}>
                    <li>{allLanguagesInNorwegian["nb-NO"]}</li>
                    {formProperties.publishedLanguages?.map((languageCode) => (
                      <li key={languageCode}>{languagesInNorwegian[languageCode]}</li>
                    ))}
                  </ul>
                )}
              </td>
              <td>
                <Timestamp timestamp={formProperties.modified} />
                <p className={statusStyles.rowText}>{formProperties.modifiedBy}</p>
              </td>
              <td>
                <Timestamp timestamp={formProperties.published} />
                <p className={statusStyles.rowText}>{formProperties.publishedBy}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    );
  };

  const LanguagePublishCheckbox = ({ languageCode }: { languageCode: string }) => (
    <Checkbox
      className="margin-bottom-default"
      label={`${languagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}
      checked={checkedLanguages[languageCode]}
      onChange={(event) => {
        setCheckedLanguages({ ...checkedLanguages, [languageCode]: !checkedLanguages[languageCode] });
      }}
    />
  );

  const IncompleteLanguageCheckbox = ({ languageCode }: { languageCode: string }) => (
    <Checkbox
      className="margin-bottom-default"
      label={`${languagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}
      disabled
    />
  );

  const isTranslationComplete = (languageCode: string) => completeTranslationLanguageCodeList.includes(languageCode);
  const isPreviouslyPublished = (languageCode: string) => form.properties.publishedLanguages?.includes(languageCode);

  return (
    <Modal open={openModal} onClose={closeModal} title="Publiseringsinnstillinger">
      <PublishStatusPanel formProperties={form.properties} />
      <Undertittel>Hvilke språkversjoner skal publiseres?</Undertittel>
      <Normaltekst className="margin-bottom-default">Valgene inkluderer kun komplette språkversjoner.</Normaltekst>
      <CheckboxGruppe className="margin-bottom-default">
        <Checkbox
          disabled
          checked
          className="margin-bottom-default"
          label={`${allLanguagesInNorwegian["nb-NO"]} (NB-NO)`}
        />
        {Object.keys(checkedLanguages).length > 0 &&
          Object.keys(languagesInNorwegian).map((languageCode) => {
            if (isTranslationComplete(languageCode)) {
              return <LanguagePublishCheckbox key={languageCode} languageCode={languageCode} />;
            } else if (isPreviouslyPublished(languageCode)) {
              return <IncompleteLanguageCheckbox key={languageCode} languageCode={languageCode} />;
            }
            return null;
          })}
      </CheckboxGruppe>

      {Object.keys(languagesInNorwegian).map(
        (languageCode) =>
          isPreviouslyPublished(languageCode) &&
          (!isTranslationComplete(languageCode) || !checkedLanguages[languageCode]) && (
            <AlertStripeAdvarsel key={`${languageCode}-alert`}>{`OBS! ${
              languagesInNorwegian[languageCode]
            } (${languageCode.toUpperCase()}) vil bli avpublisert hvis du publiserer med disse innstillingene.`}</AlertStripeAdvarsel>
          )
      )}

      <Hovedknapp
        className={styles.modal_button}
        onClick={() =>
          onPublish(completeTranslationLanguageCodeList.filter((languageCode) => checkedLanguages[languageCode]))
        }
      >
        Publiser
      </Hovedknapp>
    </Modal>
  );
};

export default PublishSettingsModal;
