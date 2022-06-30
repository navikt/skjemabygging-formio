import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { I18nTranslations, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Knapp } from "nav-frontend-knapper";
import { Normaltekst } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { useI18nState } from "../../context/i18n";

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
    <Modal isOpen={openModal} onRequestClose={closeModal} contentLabel="Publiseringsadvarsel">
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
