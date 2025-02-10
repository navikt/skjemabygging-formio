import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { localizationUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../context/old_form/FormContext';

interface Props {
  form: NavFormType;
  open: boolean;
  onClose: () => void;
  publishLanguageCodeList: string[];
}

const ConfirmPublishModal = ({ open, onClose, form, publishLanguageCodeList }: Props) => {
  const { publishForm } = useForm();
  const languageCodes = publishLanguageCodeList.map(localizationUtils.getLanguageCodeAsIso639_1);

  return (
    <ConfirmationModal
      open={open}
      onConfirm={() => publishForm(form, languageCodes)}
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
