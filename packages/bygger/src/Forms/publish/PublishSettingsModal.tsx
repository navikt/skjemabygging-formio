import { makeStyles } from "@material-ui/styles";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { FormPropertiesType, I18nTranslations, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Hovedknapp } from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import { Checkbox, CheckboxGruppe } from "nav-frontend-skjema";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { languagesInNorwegian, useI18nState } from "../../context/i18n";
import { getFormTexts } from "../../translations/utils";
import FormStatus, { determineStatus } from "../status/FormStatus";
import { useStatusStyles } from "../status/styles";
import { Timestamp } from "../status/Timestamp";

const useModalStyles = makeStyles({
  modal_button: {
    float: "right",
    margin: "1rem",
  },
});

const useStatusPanelStyles = makeStyles({
  panel: {
    display: "flex",
    padding: "0 0.5rem",
    margin: "2rem 0",
    backgroundColor: "#E8E7E7",
  },
  table: {
    width: "100%",
  },
});

interface Props {
  form: NavFormType;
  openModal: boolean;
  closeModal: () => void;
  publishModal: (string) => void;
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

const PublishSettingsModal = ({ openModal, closeModal, publishModal, form }: Props) => {
  const styles = useModalStyles();
  const { translationsForNavForm } = useI18nState();
  const [allFormOriginalTexts, setAllFormOriginalTexts] = useState<string[]>([]);
  const [completeTranslationLanguageCodeList, setCompleteTranslationLanguageCodeList] = useState<string[]>([]);
  const [publishLanguageCodeList, setPublishLanguageCodeList] = useState<string[]>([]);

  useEffect(() => {
    setAllFormOriginalTexts(
      getFormTexts(form).reduce((allTexts, texts) => {
        const { text } = texts;
        return [...allTexts, text];
      }, [])
    );
  }, [form]);

  useEffect(() => {
    setCompleteTranslationLanguageCodeList(
      getCompleteTranslationLanguageCodeList(allFormOriginalTexts, translationsForNavForm)
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
                <ul>
                  {formProperties.publishedLanguages?.map((language) => (
                    <li key={language}>{language}</li>
                  ))}
                </ul>
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

  return (
    <Modal open={openModal} onClose={closeModal} title="Publiseringsinnstillinger">
      <PublishStatusPanel formProperties={form.properties} />
      <Undertittel>Hvilke språkversjoner skal publiseres?</Undertittel>
      <Normaltekst className="margin-bottom-default">Valgene inkluderer kun komplette språkversjoner.</Normaltekst>
      <CheckboxGruppe className="margin-bottom-default">
        <Checkbox disabled checked className="margin-bottom-default" label={`Norsk bokmål (NB-NO)`} key="nb-NO" />
        {Object.keys(languagesInNorwegian).map((languageCode) => {
          const isComplete = completeTranslationLanguageCodeList.includes(languageCode);
          const isPreviouslyPublished = form.properties.publishedLanguages?.includes(languageCode);
          if (isComplete) {
            return (
              <Checkbox
                className="margin-bottom-default"
                label={`${languagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}
                key={languageCode}
                onChange={(event) => {
                  if (event.target.checked) setPublishLanguageCodeList([...publishLanguageCodeList, languageCode]);
                  else
                    setPublishLanguageCodeList([
                      ...publishLanguageCodeList.filter(
                        (publishedLanguageCode) => publishedLanguageCode !== languageCode
                      ),
                    ]);
                }}
              />
            );
          } else if (isPreviouslyPublished) {
            return (
              <Checkbox
                className="margin-bottom-default"
                label={`${languagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}
                key={languageCode}
                disabled
              />
            );
          }
          return <></>;
        })}
      </CheckboxGruppe>

      <Hovedknapp className={styles.modal_button} onClick={() => publishModal(publishLanguageCodeList)}>
        Publiser
      </Hovedknapp>
    </Modal>
  );
};

export default PublishSettingsModal;
