import { ConfirmationModal, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form, navFormUtils, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo, useState } from 'react';
import { useFormTranslations } from '../../context/translations/FormTranslationsContext';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import { generateUnsavedGlobalTranslations } from '../../translations/utils/editFormTranslationsUtils';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
import ConfirmPublishModal from './ConfirmPublishModal';
import PublishSettingsModal from './PublishSettingsModal';

const ATTACHMENTS_ERROR_MESSAGE =
  'Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.';

interface PublishModalComponentsProps {
  form: Form;
  openPublishSettingModal: boolean;
  setOpenPublishSettingModal: (open: boolean) => void;
}

const validateAttachments = (form: Form) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter(navFormUtils.isAttachment)
    .every((comp) => comp.properties?.vedleggskode && comp.properties?.vedleggstittel);

const getPaperNoCoverPageErrorMessage = (form: Form) => {
  if (!submissionTypesUtils.isPaperNoCoverPageSubmission(form.properties.submissionTypes)) {
    return undefined;
  }

  const missingFields = [
    !(form.properties.innsendingOverskrift ?? '').trim() && '«Overskrift til innsending»',
    !(form.properties.innsendingForklaring ?? '').trim() && '«Forklaring til innsending»',
  ].filter(Boolean);

  if (missingFields.length === 0) {
    return undefined;
  }

  const formattedMissingFields =
    missingFields.length === 1
      ? missingFields[0]
      : `${missingFields.slice(0, -1).join(', ')} og ${missingFields.at(-1)}`;

  return `Du må fylle ut ${formattedMissingFields} under skjemainnstillinger før skjemaet kan publiseres.`;
};

const getPublishValidationMessage = (form: Form) => {
  const validationMessages = [
    !validateAttachments(form) && ATTACHMENTS_ERROR_MESSAGE,
    getPaperNoCoverPageErrorMessage(form),
  ].filter(Boolean);

  return validationMessages.length > 0 ? validationMessages.join(' ') : undefined;
};

const PublishModalComponents = ({
  form,
  openPublishSettingModal,
  setOpenPublishSettingModal,
}: PublishModalComponentsProps) => {
  const [openPublishSettingModalValidated, setOpenPublishSettingModalValidated] = useModal();
  const [openConfirmPublishModal, setOpenConfirmPublishModal] = useModal();
  const [userMessageModal, setUserMessageModal] = useModal();
  const [lockedFormModal, setLockedFormModal] = useModal();
  const [selectedLanguageCodeList, setSelectedLanguageCodeList] = useState<string[]>([]);
  const { storedTranslations: globalTranslations, isReady: isFormTranslationsReady } = useGlobalTranslations();
  const { storedTranslations: formTranslations, isReady: isGlobalTranslationsReady } = useFormTranslations();
  const isLockedForm = !!form.lock;
  const publishValidationMessage = useMemo(() => getPublishValidationMessage(form), [form]);

  useEffect(() => {
    if (openPublishSettingModal) {
      if (isLockedForm) {
        setLockedFormModal(true);
      } else if (!publishValidationMessage) {
        setOpenPublishSettingModalValidated(true);
      } else {
        setOpenPublishSettingModal(false);
        setUserMessageModal(true);
      }
    } else {
      setOpenPublishSettingModalValidated(false);
    }
  }, [
    openPublishSettingModal,
    form,
    setOpenPublishSettingModalValidated,
    setOpenPublishSettingModal,
    setUserMessageModal,
    isLockedForm,
    setLockedFormModal,
    publishValidationMessage,
  ]);

  const unsavedGlobalTranslations = useMemo(
    () =>
      isFormTranslationsReady && isGlobalTranslationsReady
        ? generateUnsavedGlobalTranslations(form, formTranslations, globalTranslations)
        : [],
    [form, formTranslations, globalTranslations, isFormTranslationsReady, isGlobalTranslationsReady],
  );

  return (
    <>
      <PublishSettingsModal
        open={openPublishSettingModalValidated}
        onClose={() => setOpenPublishSettingModal(false)}
        onConfirm={(languageCodes) => {
          setOpenConfirmPublishModal(true);
          setSelectedLanguageCodeList(languageCodes);
        }}
        form={form}
        unsavedGlobalTranslations={unsavedGlobalTranslations}
      />
      <ConfirmPublishModal
        open={openConfirmPublishModal}
        onClose={() => setOpenConfirmPublishModal(false)}
        form={form}
        publishLanguageCodeList={selectedLanguageCodeList}
        unsavedGlobalTranslations={unsavedGlobalTranslations}
      />
      <ConfirmationModal
        open={userMessageModal}
        width={'small'}
        onClose={() => setUserMessageModal(false)}
        onConfirm={() => setUserMessageModal(false)}
        texts={{
          title: 'Brukermelding',
          confirm: 'Ok',
          body: publishValidationMessage ?? ATTACHMENTS_ERROR_MESSAGE,
        }}
      />
      <LockedFormModal open={lockedFormModal} onClose={() => setLockedFormModal(false)} form={form} />
    </>
  );
};

export default PublishModalComponents;
