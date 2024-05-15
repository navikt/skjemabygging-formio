import { ConfirmationModal } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useEffect, useState } from 'react';
import useLockedFormModal from '../../hooks/useLockedFormModal';
import ConfirmPublishModal from './ConfirmPublishModal';
import PublishSettingsModal from './PublishSettingsModal';

interface Modals {
  publishSettingModalValidated: boolean;
  confirmPublishModal: boolean;
  userMessageModal: boolean;
}

interface PartialModals extends Partial<Modals> {}

interface PublishModalComponentsProps {
  form: NavFormType;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  openPublishSettingModal: boolean;
  setOpenPublishSettingModal: (open: boolean) => void;
}

const validateAttachments = (form: NavFormType) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter(navFormUtils.isAttachment)
    .every((comp) => comp.properties?.vedleggskode && comp.properties?.vedleggstittel);

const PublishModalComponents = ({
  form,
  onPublish,
  openPublishSettingModal,
  setOpenPublishSettingModal,
}: PublishModalComponentsProps) => {
  const { lockedFormModalContent, openLockedFormModal } = useLockedFormModal(form);

  const [modals, setModals] = useState<Modals>({
    publishSettingModalValidated: false,
    confirmPublishModal: false,
    userMessageModal: false,
  });

  const [selectedLanguageCodeList, setSelectedLanguageCodeList] = useState<string[]>([]);
  const isLockedForm = form.properties.isLockedForm;

  const closeModal = useCallback(() => {
    setOpenPublishSettingModal(false);
  }, [setOpenPublishSettingModal]);

  const updateModals = useCallback(
    (newModals: PartialModals) => {
      if (Object.values(newModals).some((value) => value === false)) {
        closeModal();
      }

      setModals((prevModals) => ({
        ...prevModals,
        ...newModals,
      }));
    },
    [closeModal],
  );

  useEffect(() => {
    const handlePublishSettingModal = () => {
      if (openPublishSettingModal) {
        const attachmentsAreValid = validateAttachments(form);

        if (isLockedForm) {
          openLockedFormModal();
        } else if (attachmentsAreValid) {
          updateModals({ publishSettingModalValidated: true });
        } else {
          updateModals({ userMessageModal: true });
        }
      } else {
        updateModals({ publishSettingModalValidated: false });
      }
    };

    handlePublishSettingModal();
  }, [openPublishSettingModal, form, updateModals, isLockedForm, closeModal, openLockedFormModal]);

  return (
    <>
      <PublishSettingsModal
        open={modals.publishSettingModalValidated}
        onClose={() => closeModal()}
        onConfirm={(languageCodes) => {
          updateModals({ confirmPublishModal: true });
          setSelectedLanguageCodeList(languageCodes);
        }}
        form={form}
      />
      <ConfirmPublishModal
        open={modals.confirmPublishModal}
        onClose={() => closeModal()}
        form={form}
        onPublish={onPublish}
        publishLanguageCodeList={selectedLanguageCodeList}
      />
      <ConfirmationModal
        open={modals.userMessageModal}
        onClose={() => updateModals({ userMessageModal: false })}
        onConfirm={() => updateModals({ userMessageModal: false })}
        texts={{
          title: 'Brukermelding',
          confirm: 'Ok',
          body: 'Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.',
        }}
      />
      {lockedFormModalContent}
    </>
  );
};

export default PublishModalComponents;
