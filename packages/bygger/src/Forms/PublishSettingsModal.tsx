import { makeStyles } from "@material-ui/styles";
import { Hovedknapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import { Checkbox, CheckboxGruppe } from "nav-frontend-skjema";
import { Normaltekst, Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { I18nTranslationMap } from "../../types/translations";
import { languagesInNorwegian } from "../context/i18n";
import { useI18nState } from "../context/i18n/I18nContext";
import { getFormTexts } from "../translations/utils";
import { NavFormType } from "./navForm";

const useModalStyles = makeStyles({
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
    padding: "2rem 2.5rem",
  },
  modal_button: {
    float: "right",
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
  translationsForNavForm: Record<string, I18nTranslationMap>
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

  return (
    <Modal
      className={styles.modal}
      isOpen={openModal}
      onRequestClose={closeModal}
      closeButton={true}
      contentLabel="Publiseringsinnstillingsadvarsel"
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <Undertittel className="margin-bottom-double">Publiseringsinnstillinger</Undertittel>
      <Normaltekst className="margin-bottom-default">
        Følgende språkversjoner er tilgjengelige for dette skjemaet. Velg hvilke språkversjoner som skal publiseres.
        Språkversjoner som ikke publiseres blir utilgjengelige for brukerne.
      </Normaltekst>
      <CheckboxGruppe className="margin-bottom-default">
        {completeTranslationLanguageCodeList.map((languageCode) => (
          <Checkbox
            className="margin-bottom-default"
            label={`${languagesInNorwegian[languageCode]} (${languageCode.toUpperCase()})`}
            key={languageCode}
            onChange={(event) => {
              if (event.target.checked) setPublishLanguageCodeList([...publishLanguageCodeList, languageCode]);
              else
                setPublishLanguageCodeList([
                  ...publishLanguageCodeList.filter((publishedLanguageCode) => publishedLanguageCode !== languageCode),
                ]);
            }}
          />
        ))}
      </CheckboxGruppe>
      <Normaltekst>Bare komplette språkversjoner vises i listen ovenfor.</Normaltekst>
      <Normaltekst className="margin-bottom-default">
        En språkversjon kan bare publiseres hvis oversdettelsen er komplett
      </Normaltekst>
      <Normaltekst className="margin-bottom-default">
        Hvis du savner en språkversjon må du åpne redigering av det språket og sørge for at alle tekstene er oversatt.
      </Normaltekst>

      <Hovedknapp className={styles.modal_button} onClick={() => publishModal(publishLanguageCodeList)}>
        Publiser
      </Hovedknapp>
    </Modal>
  );
};

export default PublishSettingsModal;
