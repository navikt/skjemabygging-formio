import { Alert, Button, Checkbox, CheckboxGroup, Heading, Panel } from "@navikt/ds-react";
import { Modal, makeStyles } from "@navikt/skjemadigitalisering-shared-components";
import { FormPropertiesType, I18nTranslations, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useState } from "react";
import { languagesInNorwegian, useI18nState } from "../../context/i18n";
import { getFormTexts } from "../../translations/utils";
import FormStatus, { determineStatus } from "../status/FormStatus";
import { allLanguagesInNorwegian } from "../status/PublishedLanguages";
import Timestamp from "../status/Timestamp";
import { useStatusStyles } from "../status/styles";

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
  const [checkedLanguages, setCheckedLanguages] = useState<string[]>([]);

  useEffect(() => {
    setAllFormOriginalTexts(
      getFormTexts(form).reduce((allTexts, texts) => {
        const { text } = texts;
        return [...allTexts, text];
      }, [] as string[])
    );
  }, [form]);

  useEffect(() => {
    const completeTranslations = getCompleteTranslationLanguageCodeList(allFormOriginalTexts, translationsForNavForm);
    setCompleteTranslationLanguageCodeList(completeTranslations);
    setCheckedLanguages([...completeTranslations, "nb-NO"]);
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
    <Checkbox value={languageCode}>{`${languagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}</Checkbox>
  );

  const IncompleteLanguageCheckbox = ({ languageCode }: { languageCode: string }) => (
    <Checkbox value={languageCode} disabled>{`${
      languagesInNorwegian[languageCode]
    } (${languageCode.toUpperCase()})`}</Checkbox>
  );

  const isTranslationComplete = (languageCode: string) => completeTranslationLanguageCodeList.includes(languageCode);
  const isPreviouslyPublished = (languageCode: string) => form.properties.publishedLanguages?.includes(languageCode);

  return (
    <Modal open={openModal} onClose={closeModal} title="Publiseringsinnstillinger">
      <PublishStatusPanel formProperties={form.properties} />
      <Heading level="2" size="medium">
        Hvilke språkversjoner skal publiseres?
      </Heading>
      <CheckboxGroup
        legend="Valgene inkluderer kun komplette språkversjoner."
        value={checkedLanguages}
        onChange={(checked) => {
          setCheckedLanguages(checked);
        }}
      >
        <Checkbox disabled value={"nb-NO"}>{`${allLanguagesInNorwegian["nb-NO"]} (NB-NO)`}</Checkbox>
        {checkedLanguages.length > 0 &&
          Object.keys(languagesInNorwegian).map((languageCode) => {
            if (isTranslationComplete(languageCode)) {
              return <LanguagePublishCheckbox key={languageCode} languageCode={languageCode} />;
            } else if (isPreviouslyPublished(languageCode)) {
              return <IncompleteLanguageCheckbox key={languageCode} languageCode={languageCode} />;
            }
            return null;
          })}
      </CheckboxGroup>

      {Object.keys(languagesInNorwegian).map(
        (languageCode) =>
          isPreviouslyPublished(languageCode) &&
          (!isTranslationComplete(languageCode) || !checkedLanguages.includes(languageCode)) && (
            <Alert variant="error" key={`${languageCode}-alert`}>
              {`OBS! ${languagesInNorwegian[languageCode]} 
              (${languageCode.toUpperCase()}) vil bli avpublisert hvis du publiserer med disse innstillingene.`}
            </Alert>
          )
      )}

      <Button
        className={styles.modal_button}
        onClick={() =>
          onPublish(
            completeTranslationLanguageCodeList.filter((languageCode) => checkedLanguages.includes(languageCode))
          )
        }
      >
        Publiser
      </Button>
    </Modal>
  );
};

export default PublishSettingsModal;
