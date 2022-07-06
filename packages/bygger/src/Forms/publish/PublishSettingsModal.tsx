import { makeStyles } from "@material-ui/styles";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { I18nTranslations, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Hovedknapp } from "nav-frontend-knapper";
import { Checkbox, CheckboxGruppe } from "nav-frontend-skjema";
import { Normaltekst } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { languagesInNorwegian, useI18nState } from "../../context/i18n";
import { getFormTexts } from "../../translations/utils";

const useModalStyles = makeStyles({
  modal_button: {
    float: "right",
    margin: "1rem",
  },
});

interface Props {
  form: NavFormType;
  openModal: boolean;
  closeModal: () => void;
  publishModal: (string) => void;
  appElement?: string | HTMLElement;
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

const PublishSettingsModal = ({ openModal, closeModal, publishModal, form, appElement }: Props) => {
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
    <Modal open={openModal} onClose={closeModal} title="Publiseringsinnstillinger" appElement={appElement}>
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
