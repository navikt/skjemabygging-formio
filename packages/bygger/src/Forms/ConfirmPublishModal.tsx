import Modal from "nav-frontend-modal";
import { Knapp } from "nav-frontend-knapper";
import React, { useMemo, useState, useEffect } from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslations } from "../context/i18n";
import { Normaltekst } from "nav-frontend-typografi";
import { NavFormType } from "./navForm";
import { I18nTranslationMap } from "../../types/translations";

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

const ConfirmPublishModal = ({ openModal, closeModal, form, publishLanguageCodeList, onPublish }: Props) => {
  const [publiserer, setPubliserer] = useState(false);
  const styles = useModalStyles();
  const { getLocalTranslationsForNavForm }: any = useTranslations();
  const [completeLocalTranslationsForNavForm, setCompleteLocalTranslationsForNavForm] = useState<I18nTranslationMap>(
    {}
  );

  const localTranslationsForNavForm: I18nTranslationMap = useMemo(
    () => getLocalTranslationsForNavForm(),
    [getLocalTranslationsForNavForm]
  );

  useEffect(() => {
    Object.keys(localTranslationsForNavForm).forEach((languageCode) => {
      if (publishLanguageCodeList.indexOf(languageCode) >= 0) {
        setCompleteLocalTranslationsForNavForm((completeLocalTranslationsForNavForm) => ({
          ...completeLocalTranslationsForNavForm,
          [languageCode]: localTranslationsForNavForm[languageCode],
        }));
      }
    });
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
