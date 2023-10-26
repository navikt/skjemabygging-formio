import { navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import UserMessageModal, { useUserMessage } from '../../components/UserMessageModal';
import { useModal } from '../../util/useModal';
import ConfirmPublishModal from './ConfirmPublishModal';
import PublishSettingsModal from './PublishSettingsModal';

const validateAttachments = (form) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter(navFormUtils.isAttachment)
    .every((comp) => comp.properties?.vedleggskode && comp.properties?.vedleggstittel);

const PublishModalComponents = ({ form, onPublish, openPublishSettingModal, setOpenPublishSettingModal }) => {
  const [openPublishSettingModalValidated, setOpenPublishSettingModalValidated] = useModal(false);
  const [openConfirmPublishModal, setOpenConfirmPublishModal] = useModal(false);
  const [userMessage, showUserMessage, closeUserMessageModal] = useUserMessage();
  const [selectedLanguageCodeList, setSelectedLanguageCodeList] = useState<string[]>([]);

  useEffect(() => {
    if (openPublishSettingModal) {
      const attachmentsAreValid = validateAttachments(form);
      if (attachmentsAreValid) {
        setOpenPublishSettingModalValidated(true);
      } else {
        setOpenPublishSettingModal(false);
        showUserMessage('Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.');
      }
    } else {
      setOpenPublishSettingModalValidated(false);
    }
  }, [openPublishSettingModal, form, setOpenPublishSettingModalValidated, setOpenPublishSettingModal, showUserMessage]);

  return (
    <>
      <PublishSettingsModal
        openModal={openPublishSettingModalValidated}
        closeModal={() => setOpenPublishSettingModal(false)}
        onPublish={(languageCodes) => {
          setOpenPublishSettingModal(false);
          setOpenConfirmPublishModal(true);
          setSelectedLanguageCodeList(languageCodes);
        }}
        form={form}
      />
      <ConfirmPublishModal
        openModal={openConfirmPublishModal}
        closeModal={() => setOpenConfirmPublishModal(false)}
        form={form}
        onPublish={onPublish}
        publishLanguageCodeList={selectedLanguageCodeList}
      />
      <UserMessageModal userMessage={userMessage} closeModal={closeUserMessageModal} />
    </>
  );
};

export default PublishModalComponents;
