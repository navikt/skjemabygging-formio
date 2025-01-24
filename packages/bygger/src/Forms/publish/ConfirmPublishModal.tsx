import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useI18nState } from '../../context/i18n';
import { useForm } from '../../context/old_form/FormContext';

interface Props {
  form: NavFormType;
  open: boolean;
  onClose: () => void;
  publishLanguageCodeList: string[];
}

const getCompleteLocalTranslationsForNavForm = (
  localTranslationsForNavForm: I18nTranslations,
  publishLanguageCodeList: string[],
): I18nTranslations => {
  return Object.keys(localTranslationsForNavForm).reduce((translations: object, languageCode: string) => {
    if (publishLanguageCodeList.indexOf(languageCode) >= 0) {
      return { ...translations, [languageCode]: localTranslationsForNavForm[languageCode] };
    } else return { ...translations };
  }, {});
};

const ConfirmPublishModal = ({ open, onClose, form, publishLanguageCodeList }: Props) => {
  const { publishForm } = useForm();
  const { localTranslationsForNavForm } = useI18nState();
  const [completeLocalTranslationsForNavForm, setCompleteLocalTranslationsForNavForm] = useState<I18nTranslations>({});

  useEffect(() => {
    setCompleteLocalTranslationsForNavForm(
      getCompleteLocalTranslationsForNavForm(localTranslationsForNavForm, publishLanguageCodeList),
    );
  }, [publishLanguageCodeList, localTranslationsForNavForm]);

  return (
    <ConfirmationModal
      open={open}
      onConfirm={() => publishForm(form, completeLocalTranslationsForNavForm)}
      onClose={onClose}
      texts={{
        title: 'Publiseringsadvarsel',
        body: 'Er du sikker på at dette skjemaet skal publiseres?',
        confirm: 'Ja, publiser skjemaet',
        cancel: 'Nei, ikke publiser skjemaet',
      }}
    />
  );
};

export default ConfirmPublishModal;
