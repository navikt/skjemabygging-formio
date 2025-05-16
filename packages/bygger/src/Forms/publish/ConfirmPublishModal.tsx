import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form, FormsApiTranslation, localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useFeedbackEmit } from '../../context/notifications/FeedbackContext';
import { useForm } from '../../context/old_form/FormContext';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';

interface Props {
  form: Form;
  open: boolean;
  onClose: () => void;
  publishLanguageCodeList: string[];
  unsavedGlobalTranslations: FormsApiTranslation[];
}

const ConfirmPublishModal = ({ open, onClose, form, publishLanguageCodeList, unsavedGlobalTranslations }: Props) => {
  const { publishForm } = useForm();
  const { saveTranslation, loadTranslations } = useFormTranslations();
  const feedbackEmit = useFeedbackEmit();

  const languageCodes = publishLanguageCodeList.map(localizationUtils.getLanguageCodeAsIso639_1);

  const handlePublish = async () => {
    if (unsavedGlobalTranslations.length > 0) {
      try {
        await Promise.all(unsavedGlobalTranslations.map(saveTranslation));
        // Load translations to be in sync in case the user navigates to the translations page
        await loadTranslations();
      } catch (error) {
        const message = (error as Error)?.message;
        feedbackEmit.error(
          `Autolagring av oversettelser feilet. Prøv å laste siden på nytt og forsøk å publisere på nytt. ${message}`,
        );
        return;
      }
    }
    await publishForm(form, languageCodes);
  };

  return (
    <ConfirmationModal
      open={open}
      onConfirm={handlePublish}
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
