import { ConfirmationModal, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
import ConfirmPublishModal from './ConfirmPublishModal';
import PublishSettingsModal from './PublishSettingsModal';

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
  const isLockedForm = !!form.lock;

  useEffect(() => {
    if (openPublishSettingModal) {
      const attachmentsAreValid = validateAttachments(form);
      if (isLockedForm) {
        setLockedFormModal(true);
      } else if (attachmentsAreValid) {
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
  ]);

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
      />
      <ConfirmPublishModal
        open={openConfirmPublishModal}
        onClose={() => setOpenConfirmPublishModal(false)}
        form={form}
        publishLanguageCodeList={selectedLanguageCodeList}
      />
      <ConfirmationModal
        open={userMessageModal}
        width={'small'}
        onClose={() => setUserMessageModal(false)}
        onConfirm={() => setUserMessageModal(false)}
        texts={{
          title: 'Brukermelding',
          confirm: 'Ok',
          body: 'Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.',
        }}
      />
      <LockedFormModal open={lockedFormModal} onClose={() => setLockedFormModal(false)} form={form} />
    </>
  );
};

export default PublishModalComponents;
