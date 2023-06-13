import { Component, navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useState } from "react";
import UserMessageModal, { useUserMessage } from "../../components/UserMessageModal";
import { useModal } from "../../util/useModal";
import ConfirmPublishModal from "./ConfirmPublishModal";
import PublishSettingsModal from "./PublishSettingsModal";

const isAttachment = (comp: Component) => comp.values?.some((v) => v.value === "leggerVedNaa");

const isAllAttachmentsValid = (form) =>
  navFormUtils
    .flattenComponents(form.components)
    .filter(isAttachment)
    .every((comp) => comp.properties?.vedleggskode && comp.properties?.vedleggstittel);

const PublishModalComponents = ({ form, onPublish, openPublishSettingModal, setOpenPublishSettingModal }) => {
  const [open, setOpen] = useModal(false);
  const [openConfirmPublishModal, setOpenConfirmPublishModal] = useModal(false);
  const [userMessage, showUserMessage, closeUserMessageModal] = useUserMessage();
  const [selectedLanguageCodeList, setSelectedLanguageCodeList] = useState<string[]>([]);

  useEffect(() => {
    if (openPublishSettingModal) {
      const attachmentsAreValid = isAllAttachmentsValid(form);
      if (attachmentsAreValid) {
        setOpen(true);
      } else {
        setOpenPublishSettingModal(false);
        showUserMessage("Du må fylle ut vedleggskode og vedleggstittel for alle vedlegg før skjemaet kan publiseres.");
      }
    } else {
      setOpen(false);
    }
  }, [openPublishSettingModal, form, setOpen, setOpenPublishSettingModal, showUserMessage]);

  return (
    <>
      <PublishSettingsModal
        openModal={open}
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
