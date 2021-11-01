import Modal from "nav-frontend-modal";
import { Hovedknapp } from "nav-frontend-knapper";
import React, { useEffect, useMemo, useState } from "react";
import { makeStyles } from "@material-ui/styles";
import { CheckboxGruppe, Checkbox } from "nav-frontend-skjema";
import { Undertittel, Normaltekst } from "nav-frontend-typografi";
import { getAllTextsOrParsedTexts } from "../translations/utils";
import { languagesInNorwegian, useTranslations } from "../context/i18n";

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

const PublishSettingsModal = ({ openModal, closeModal, publishModal, form }) => {
  const styles = useModalStyles();
  const { getTranslationsForNavForm } = useTranslations();
  const [allFormText, setAllFormText] = useState([]);
  const [completeTranslationList, setCompleteTranslationList] = useState([]);
  const [publishLanguageCodeList, setPublishLanguageCodeList] = useState([]);

  const translationsForNavForm = useMemo(() => getTranslationsForNavForm(), [getTranslationsForNavForm]);

  useEffect(() => {
    setAllFormText(
      getAllTextsOrParsedTexts(form, false).reduce((allTexts, texts) => {
        const { text } = texts;
        return [...allTexts, text];
      }, [])
    );
  }, [form]);

  useEffect(() => {
    Object.keys(translationsForNavForm).forEach((languageCode) => {
      const incompleteTranslationList = allFormText.filter(
        (formText) => Object.keys(translationsForNavForm[languageCode]).indexOf(formText) < 0
      );

      if (incompleteTranslationList.length === 0) {
        setCompleteTranslationList((completeTranslationList) => [...completeTranslationList, languageCode]);
      }
    });
  }, [allFormText, translationsForNavForm]);

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
        {completeTranslationList.map((completeTranslation) => (
          <Checkbox
            className="margin-bottom-default"
            label={`${languagesInNorwegian[completeTranslation]}(${completeTranslation})`}
            key={completeTranslation}
            onChange={(event) => {
              if (event.target.value === "on")
                setPublishLanguageCodeList((publishLanguageCodeList) => [
                  ...publishLanguageCodeList,
                  completeTranslation,
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
