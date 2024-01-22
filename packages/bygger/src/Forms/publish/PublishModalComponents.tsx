import { ConfirmationModal, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import ConfirmPublishModal from './ConfirmPublishModal';
import PublishSettingsModal from './PublishSettingsModal';

const validateAttachments = (form: NavFormType) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter(navFormUtils.isAttachment)
    .every((comp) => comp.properties?.vedleggskode && comp.properties?.vedleggstittel);

const PublishModalComponents = ({ form, onPublish, openPublishSettingModal, setOpenPublishSettingModal }) => {
  const [openPublishSettingModalValidated, setOpenPublishSettingModalValidated] = useModal();
  const [openConfirmPublishModal, setOpenConfirmPublishModal] = useModal();
  const [userMessageModal, setUserMessageModal] = useModal();
  const [selectedLanguageCodeList, setSelectedLanguageCodeList] = useState<string[]>([]);

  useEffect(() => {
    if (openPublishSettingModal) {
      const attachmentsAreValid = validateAttachments(form);
      if (attachmentsAreValid) {
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
        onPublish={onPublish}
        publishLanguageCodeList={selectedLanguageCodeList}
      />
      <ConfirmationModal
        open={userMessageModal}
        onClose={() => setUserMessageModal(false)}
        onConfirm={() => setUserMessageModal(false)}
        texts={{
          title: 'Brukermelding',
          confirm: 'Ok',
          body: 'Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.',
        }}
      />
    </>
  );
};

export default PublishModalComponents;
