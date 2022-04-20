import { makeStyles } from "@material-ui/styles";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain/types/form";
import { Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import { Normaltekst } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { I18nTranslations } from "../../types/translations";
import { useI18nState } from "../context/i18n";

const useModalStyles = makeStyles({
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
    padding: "2rem 2.5rem",
  },
});

interface Props {
  form: NavFormType;
  openModal: boolean;
  closeModal: () => void;
  publishLanguageCodeList: string[];
  onPublish: Function;
}

const getCompleteLocalTranslationsForNavForm = (
  localTranslationsForNavForm: I18nTranslations,
  publishLanguageCodeList: string[]
): I18nTranslations => {
  return Object.keys(localTranslationsForNavForm).reduce((translations: {}, languageCode: string) => {
    if (publishLanguageCodeList.indexOf(languageCode) >= 0) {
      return { ...translations, [languageCode]: localTranslationsForNavForm[languageCode] };
    } else return { ...translations };
  }, {});
};

const ConfirmPublishModal = ({ openModal, closeModal, form, publishLanguageCodeList, onPublish }: Props) => {
  const [publiserer, setPubliserer] = useState(false);
  const styles = useModalStyles();
  const { localTranslationsForNavForm } = useI18nState();
  const [completeLocalTranslationsForNavForm, setCompleteLocalTranslationsForNavForm] = useState<I18nTranslations>({});

  useEffect(() => {
    setCompleteLocalTranslationsForNavForm(
      getCompleteLocalTranslationsForNavForm(localTranslationsForNavForm, publishLanguageCodeList)
    );
  }, [publishLanguageCodeList, localTranslationsForNavForm]);

  const onPublishClick = async (form, translations) => {
    setPubliserer(true);
    try {
      await onPublish(form, translations);
    } finally {
      setPubliserer(false);
      closeModal();
    }
  };
  return (
    <Modal
      className={styles.modal}
      isOpen={openModal}
      onRequestClose={closeModal}
      closeButton={true}
      contentLabel="Publiseringsadvarsel"
      shouldCloseOnOverlayClick={false}
      ariaHideApp={false}
    >
      <Normaltekst className="margin-bottom-double">Er du sikker på at dette skjemaet skal publiseres?</Normaltekst>
      <ul className="list-inline">
        <li className="list-inline-item">
          <Knapp onClick={() => onPublishClick(form, completeLocalTranslationsForNavForm)} spinner={publiserer}>
            Ja, publiser skjemaet
          </Knapp>
        </li>
        <li className="list-inline-item">
          <Knapp onClick={closeModal}>Nei, ikke publiser skjemaet</Knapp>
        </li>
      </ul>
    </Modal>
  );
};

export default ConfirmPublishModal;
