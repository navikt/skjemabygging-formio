import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useI18nState } from '../../context/i18n';

interface Props {
  form: NavFormType;
  open: boolean;
  onClose: () => void;
  publishLanguageCodeList: string[];
  onPublish: Function;
}

const getCompleteLocalTranslationsForNavForm = (
  localTranslationsForNavForm: I18nTranslations,
  publishLanguageCodeList: string[],
): I18nTranslations => {
  return Object.keys(localTranslationsForNavForm).reduce((translations: {}, languageCode: string) => {
    if (publishLanguageCodeList.indexOf(languageCode) >= 0) {
      return { ...translations, [languageCode]: localTranslationsForNavForm[languageCode] };
    } else return { ...translations };
  }, {});
};

const ConfirmPublishModal = ({ open, onClose, form, publishLanguageCodeList, onPublish }: Props) => {
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
      onConfirm={() => onPublish(form, completeLocalTranslationsForNavForm)}
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
